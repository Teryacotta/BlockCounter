import { ItemStack } from "@minecraft/server";

export function getMaxStackSize(id) {
    try {
        const tempStack = new ItemStack(id, 1);
        return tempStack.getMaxStackSize();
    } catch (e) {
        return 64;
    }
}

export function sendLocalizedMessage(player, key, params = []) {
    player.sendMessage({
        rawtext: [
            {
                translate: key,
                with: params.map(p => String(p))
            }
        ]
    });
}

export function getTargetBlock(player) {
    const viewBlock = player.getBlockFromViewDirection({ maxDistance: 8});
    if (!viewBlock) {
        return null;
    }

    return viewBlock.block
}