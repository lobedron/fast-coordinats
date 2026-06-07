const leftX = document.getElementById('leftX'), leftY = document.getElementById('leftY'), leftZ = document.getElementById('leftZ');
const rightX = document.getElementById('rightX'), rightY = document.getElementById('rightY'), rightZ = document.getElementById('rightZ');
const leftInputs = [leftX, leftY, leftZ], rightInputs = [rightX, rightY, rightZ];
let leftIsOverworld = true;

function recalc(fromLeft) {
    const [srcX, srcY, srcZ] = fromLeft ? leftInputs : rightInputs;
    const [dstX, dstY, dstZ] = fromLeft ? rightInputs : leftInputs;
    const srcIsOverworld = fromLeft ? leftIsOverworld : !leftIsOverworld;

    let x = parseFloat(srcX.value) || 0, y = parseFloat(srcY.value) || 0, z = parseFloat(srcZ.value) || 0;

    if (srcIsOverworld) {
        dstX.value = Math.floor(x / 8);
        dstZ.value = Math.floor(z / 8);
    } else {
        dstX.value = Math.floor(x * 8);
        dstZ.value = Math.floor(z * 8);
    }
    dstY.value = Math.floor(y);
}

function swapDimensions() {
    leftIsOverworld = !leftIsOverworld;
    [leftX.value, rightX.value] = [rightX.value, leftX.value];
    [leftY.value, rightY.value] = [rightY.value, leftY.value];
    [leftZ.value, rightZ.value] = [rightZ.value, leftZ.value];
    
    document.getElementById('leftDimName').textContent = leftIsOverworld ? "OVERWORLD" : "NETHER";
    document.getElementById('rightDimName').textContent = !leftIsOverworld ? "OVERWORLD" : "NETHER";
    document.body.className = leftIsOverworld ? "theme-normal" : "theme-swapped";
    recalc(true);
}

function triggerPaste(isLeft) {
    navigator.clipboard.readText().then(text => {
        const matches = text.match(/-?\d+/g);
        if (matches) {
            const inputs = isLeft ? leftInputs : rightInputs;
            inputs[0].value = matches[0] || 0;
            inputs[1].value = matches[1] || 0;
            inputs[2].value = matches[2] || 0;
            recalc(isLeft);
        }
    });
}

document.getElementById('swapBtn').addEventListener('click', swapDimensions);
leftInputs.forEach(i => i.addEventListener('input', () => recalc(true)));
rightInputs.forEach(i => i.addEventListener('input', () => recalc(false)));