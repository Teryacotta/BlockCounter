import * as utils from "./utils.js";
import { countBlocks } from "./counter.js";
import * as selection from "./selection.js";
import { world, system } from "@minecraft/server";

const stackCache = new Map();
const playerPositions = new Map();
const lastUseTick = new Map();
const COOLTIME_TICKS = 5;

function getCachedMaxStack(id) {
    if (!stackCache.has(id)) {
        stackCache.set(id, utils.getMaxStackSize(id));
    }
    return stackCache.get(id);
}

// 地点1の処理
world.beforeEvents.playerBreakBlock.subscribe((event) => {
    const { player, block} = event;
    const item = player.getComponent("inventory").container.getItem(player.selectedSlotIndex)
    const lastTick = lastUseTick.get(player.id) || 0;

    if (item?.typeId === "minecraft:stick") {
        event.cancel = true;
        
        //もし最後の保存から指定したtick分経過していなかったら処理を止める
        if (system.currentTick - lastTick < COOLTIME_TICKS) {
            return;
        }
        system.run(() => {
            selection.savePosition(player, block.location, 1, playerPositions);
            lastUseTick.set(player.id, system.currentTick)
            utils.sendLocalizedMessage(player, "blockcounter.save.pos1", [block.location.x,block.location.y,block.location.z])
        })
    }
});

//地点2の処理
world.afterEvents.itemUse.subscribe((event) => {
    const player = event.source;
    const item = event.itemStack;
    const lastTick = lastUseTick.get(player.id) || 0;
    if (item?.typeId === "minecraft:stick") {

        //もし最後の保存から指定したtick分経過していなかったら処理を止める
        if (system.currentTick - lastTick < COOLTIME_TICKS) {
            return;
        }
        const block = utils.getTargetBlock(player)
        if (block) {
            selection.savePosition(player, block.location, 2, playerPositions);
            lastUseTick.set(player.id, system.currentTick)
            utils.sendLocalizedMessage(player, "blockcounter.save.pos2", [block.location.x,block.location.y,block.location.z])
        }
    }
});


// !count [stack] [include/exclude] [block.id,...]
world.beforeEvents.chatSend.subscribe((event) => {
    const { message, sender: player} = event;
    const command = message.split(" ")[0];

    if (command === "!count") {
        event.cancel = true;
        
        const data = playerPositions.get(player.id);
        
        // 範囲エラー
        if (!data || !data.pos1 || !data.pos2) {
            utils.sendLocalizedMessage(player, "blockcounter.error.area")
            return;
        }

        //コマンドの引数を分解する
        const args = message.split(" ");
        let isStack = false
        let mode = undefined
        let rawFilterList = []

        // stackでの分岐
        if (args[1] === "stack") {
            isStack = true
            mode = args[2]
            rawFilterList = args[3] ? args[3].split(",") : [];
        } else if (["include", "exclude"].includes(args[1])) {
            mode = args[1]
            rawFilterList = args[2] ? args[2].split(",") : [];
        } else if (!(args[1] === undefined)) {
            utils.sendLocalizedMessage(player, "blockcounter.error.count", [])
            return;
        }
        const filterList = rawFilterList.map(id => id.includes(":") ? id : `minecraft:${id}`);

        //カウント
        system.run(() => {
            const { totalCount, results } =  countBlocks(player, data.pos1, data.pos2, mode, filterList);
            
            //チャットに表示
            utils.sendLocalizedMessage(player, "blockcounter.resurts", [])
            utils.sendLocalizedMessage(player, "blockcounter.total", [totalCount])
            for (const [id, count] of results) {
                
                const maxStack = id.includes("_sign") || id.includes("banner") ? 16 : getCachedMaxStack(id);

                const shortId = id.replace("minecraft:", "");
                const stacks = Math.floor(count / maxStack)
                const remainder = count % maxStack
                let amount = {translate:"blockcounter.amount",with:[count.toString(    )]}
                if (isStack) {
                    if (remainder === 0) amount = {translate:"blockcounter.amount.stack.nmod",with:[stacks.toString()]}
                    else if (stacks > 0) amount = {translate:"blockcounter.amount.stack",with:[stacks.toString(),remainder.toString()]}
                }
                player.sendMessage({
                    rawtext: [
                        {translate: `tile.${shortId}.name`},
                        amount
                    ]
                });
            }
        })
    } 
    //コマンドでの地点1処理
    else if (command === "!pos1") {
        const { sender: player } = event;
        event.cancel = true;
        
        system.run(() => {
            const pos = player.location
            const tPos = Object.fromEntries(
                Object.entries(pos).map(([k, v]) => [k, Math.trunc(v)])
            );
            selection.savePosition(player, tPos, 1, playerPositions);
            utils.sendLocalizedMessage(player, "blockcounter.save.pos1", [tPos.x,tPos.y,tPos.z])
        })
    }
    //コマンドでの地点2処理
    else if (command === "!pos2") {
        const { sender: player } = event;
        event.cancel = true;
        
        system.run(() => {
            const pos = player.location
            //小数点切り捨て
            const tPos = Object.fromEntries(
                Object.entries(pos).map(([k, v]) => [k, Math.trunc(v)])
            );
            selection.savePosition(player, tPos, 2, playerPositions);
            utils.sendLocalizedMessage(player, "blockcounter.save.pos2", [tPos.x,tPos.y,tPos.z])
        })
    }
});