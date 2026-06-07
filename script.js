const leftX = document.getElementById('leftX'), leftY = document.getElementById('leftY'), leftZ = document.getElementById('leftZ');
const rightX = document.getElementById('rightX'), rightY = document.getElementById('rightY'), rightZ = document.getElementById('rightZ');
const panelLeft = document.getElementById('panelLeft'), panelRight = document.getElementById('panelRight');
const toast = document.getElementById('toast');

const leftInputs = [leftX, leftY, leftZ];
const rightInputs = [rightX, rightY, rightZ];

let leftIsOverworld = true;

const floorDiv8 = (n) => Math.floor(n / 8);
const floorMul8 = (n) => Math.floor(n * 8);

function sanitize(str) {
    if (!str) return "0";
    let cleaned = str.replace(/[^\d.-]/g, '');
    if (cleaned === '' || cleaned === '-') return "0";
    return parseFloat(cleaned).toString();
}

function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

// Обновление тем оформления панелей и всего фона страницы
function updateThemes() {
    document.getElementById('leftDimName').textContent = leftIsOverworld ? "OVERWORLD" : "NETHER";
    document.getElementById('rightDimName').textContent = !leftIsOverworld ? "OVERWORLD" : "NETHER";

    if (leftIsOverworld) {
        panelLeft.className = "panel theme-overworld";
        panelRight.className = "panel theme-nether";
        document.body.className = "theme-normal";
    } else {
        panelLeft.className = "panel theme-nether";
        panelRight.className = "panel theme-overworld";
        document.body.className = "theme-swapped";
    }
}

let isRecursing = false;
function recalc(fromLeft) {
    if (isRecursing) return;
    isRecursing = true;

    const srcX = fromLeft ? leftX : rightX;
    const srcY = fromLeft ? leftY : rightY;
    const srcZ = fromLeft ? leftZ : rightZ;
    const dstX = fromLeft ? rightX : leftX;
    const dstY = fromLeft ? rightY : leftY;
    const dstZ = fromLeft ? rightZ : leftZ;

    let x = parseFloat(srcX.value) || 0;
    let y = parseFloat(srcY.value) || 0;
    let z = parseFloat(srcZ.value) || 0;

    const srcIsOverworld = fromLeft ? leftIsOverworld : !leftIsOverworld;

    if (srcIsOverworld) {
        dstX.value = floorDiv8(x);
        dstZ.value = floorDiv8(z);
    } else {
        dstX.value = floorMul8(x);
        dstZ.value = floorMul8(z);
    }
    dstY.value = Math.floor(y);

    isRecursing = false;
}

function swapDimensions() {
    leftIsOverworld = !leftIsOverworld;
    
    const tempX = leftX.value, tempY = leftY.value, tempZ = leftZ.value;
    leftX.value = rightX.value; leftY.value = rightY.value; leftZ.value = rightZ.value;
    rightX.value = tempX; rightY.value = tempY; rightZ.value = tempZ;

    updateThemes();

    panelLeft.classList.remove('animate-swap');
    panelRight.classList.remove('animate-swap');
    void panelLeft.offsetWidth; 
    panelLeft.classList.add('animate-swap');
    panelRight.classList.add('animate-swap');

    recalc(true);
    showToast("Миры поменялись местами");
}

// Умная вставка 2.0 (Решает проблему с 2 или 3 числами)
function parseAndFillCoords(text, inputs, isLeft) {
    const matches = text.match(/-?\d+/g);
    
    if (matches) {
        if (matches.length >= 3) {
            // Если скопировано 3 числа (X Y Z), заполняем всё
            inputs[0].value = matches[0];
            inputs[1].value = matches[1];
            inputs[2].value = matches[2];
            showToast(`Вставлено!`);
        } else if (matches.length === 2) {
            // Если скопировано только 2 числа (например, 932 32), скрипт понимает это как X и Z
            inputs[0].value = matches[0];
            inputs[2].value = matches[1];
            showToast(`Вставлено: X и Z (Y пропущен)`);
        } else {
            // Если всего 1 число, вставляем его в первое поле (X)
            inputs[0].value = matches[0];
            showToast(`Вставлено число в X`);
        }
        recalc(isLeft);
        return true;
    }
    return false;
}

// Привязка логики к кнопке «Вставить»
function triggerPaste(isLeft) {
    const inputs = isLeft ? leftInputs : rightInputs;
    navigator.clipboard.readText().then(text => {
        if (!parseAndFillCoords(text, inputs, isLeft)) {
            showToast("В буфере нет подходящих чисел");
        }
    }).catch(() => {
        showToast("Нет разрешения на чтение буфера");
    });
}

function setupInputs(inputs, isLeft) {
    inputs.forEach((input, index) => {
        // Механика 1: Убираем 0 при фокусе, возвращаем если пусто
        input.addEventListener('focus', () => {
            if (input.value === "0") input.value = "";
        });
        
        input.addEventListener('blur', () => {
            if (input.value.trim() === "") input.value = "0";
            else input.value = sanitize(input.value);
        });

        // Механика 2: Переходы по Enter и Стрелочкам (Вверх / Вниз)
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === 'ArrowDown') {
                if (e.key === 'Enter') e.preventDefault();
                if (index < 2) inputs[index + 1].focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (index > 0) inputs[index - 1].focus();
            }
        });

        // Поддержка контекстной умной вставки прямо в инпуты
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            let text = (e.clipboardData || window.clipboardData).getData('text');
            const matches = text.match(/-?\d+/g);
            if (matches && matches.length >= 2) {
                parseAndFillCoords(text, inputs, isLeft);
            } else if (matches && matches.length === 1) {
                input.value = matches[0];
                recalc(isLeft);
                showToast(`Введено число`);
            }
        });

        input.addEventListener('input', () => recalc(isLeft));
    });
}

function copyCoords(isLeft) {
    const inputs = isLeft ? leftInputs : rightInputs;
    const text = `${inputs[0].value} ${inputs[1].value} ${inputs[2].value}`;
    
    navigator.clipboard.writeText(text).then(() => {
        showToast(`Скопировано: ${text}`);
    });
}

document.getElementById('swapBtn').addEventListener('click', swapDimensions);

setupInputs(leftInputs, true);
setupInputs(rightInputs, false);

updateThemes();