export function countBlocks(player, p1, p2, mode, filterList) {
    const results = new Map();
    let totalCount = 0;

    // 範囲の最小値、最大値
    const minX = Math.min(p1.x, p2.x);
    const minY = Math.min(p1.y, p2.y);
    const minZ = Math.min(p1.z, p2.z);
    const maxX = Math.max(p1.x, p2.x);
    const maxY = Math.max(p1.y, p2.y);
    const maxZ = Math.max(p1.z, p2.z);

    const dimension = player.dimension

    for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
            for (let z = minZ; z <= maxZ; z++) {
                let amount = 1;
                const block = dimension.getBlock({ x, y, z })
                let typeId = block.typeId;
                if (!block || typeId === "minecraft:air") continue;
                if (typeId === "minecraft:piston_arm_collision") continue;
                if (typeId === "minecraft:sticky_piston_arm_collision") continue;

                //ドアやベッドなどの特殊なスペースを要するブロックを1カウントとして扱う
                const permutation = block.permutation;
                if (permutation.getState("upper_block_bit") === true ||
                    permutation.getState("half") === "upper") {
                        continue;
                }
                if (permutation.getState("head_piece_bit") === true) {
                        continue;
                }

                //IDの正規化
                if (typeId.includes("wall_sign")) typeId = typeId.replace("wall_sign", "standing_sign");
                if (typeId.includes("double_slab") || typeId.includes("double_") && typeId.includes("copper")) {
                    typeId = typeId.replace("double_", "");
                    amount = 2;
                }

                if (typeId === "minecraft:lit_redstone_lamp") typeId = "minecraft:redstone_lamp"
                if (typeId === "minecraft:lit_redstone_ore") typeId = "minecraft:redstone_ore"
                if (typeId === "minecraft:lit_deepslate_redstone_ore") typeId = "minecraft:deepslate_redstone_ore"
                if (typeId === "minecraft:unpowered_repeater" || typeId === "minecraft:powered_repeater") typeId ="minecraft:repeater"
                if (typeId === "minecraft:unpowered_comparator" || typeId === "minecraft:powered_comparator") typeId ="minecraft:comparator"
                if (typeId === "minecraft:unlit_redstone_torch") typeId = "minecraft:redstone_torch"
                if (typeId === "minecraft:bamboo_sapling") typeId = "minecraft:bamboo"
                if (typeId === "minecraft:wall_banner") typeId = "minecraft:standing_banner"

                if (mode === "include" && !filterList.includes(typeId)) continue;
                if (mode === "exclude" && filterList.includes(typeId)) continue;

                results.set(typeId, (results.get(typeId) || 0) + amount);
                totalCount++;
            
            }
        }
    }
    return { totalCount, results }
}