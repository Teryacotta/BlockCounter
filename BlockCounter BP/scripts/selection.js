import { system } from "@minecraft/server";

export function savePosition(player, pos, index, playerPositions) {
    if (!playerPositions.has(player.id)) {
        playerPositions.set(player.id, {pos1: undefined, pos2: undefined });
    }

    const data = playerPositions.get(player.id);
    if (index === 1) data.pos1 = pos;
    else if (index === 2) data.pos2 = pos;
}