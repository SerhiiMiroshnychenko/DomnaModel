/**
 * Пофакторний аналіз доменної плавки — Загальногалузева методика.
 *
 * Типи рядків (t):
 *   S  = заголовок секції
 *   F  = заголовок фактору (rowspan = s, номер = n)
 *   C  = підзаголовок умови (візуальний, без даних)
 *   D  = рядок з даними (під-фактор, без колонки №)
 *   R  = самостійний рядок з даними (має свій №)
 *
 * Типи розрахунку (c):
 *   p  = pair (ПГ / ПУТ, % на крок)
 *   r  = replacement (коефіцієнт заміни, кг/од.)
 *   a  = absolute (кг/т для коксу, % для продуктивності)
 *   s  = single (одне значення для коксу, без поділу на ПГ/ПУТ)
 */

"use strict";

// ====================================================================
//  ДАНІ ТАБЛИЦІ 1 (з оновленнями п.7, п.19, п.20)
// ====================================================================

const DATA = [

// ─────────── ШИХТОВІ УМОВИ ───────────
{t:'S', x:'Шихтові умови (п.1–4)'},

{t:'F', n:'1', s:5, x:'Підвищення вмісту заліза на кожен 1 % (у всій шихті без коксу та CO<sub>2</sub> флюсу)'},
{t:'D', id:'1a', g:'1fe', x:'в межах до 50 %',  c:'p', st:1, u:'%', pg:-1.4, pt:-1.88, pr:2.4},
{t:'D', id:'1b', g:'1fe', x:'в межах 50–55 %',  c:'p', st:1, u:'%', pg:-1.2, pt:-1.61, pr:2.0},
{t:'D', id:'1c', g:'1fe', x:'в межах 55–60 %',  c:'p', st:1, u:'%', pg:-1.0, pt:-1.34, pr:1.7},
{t:'D', id:'1d', g:null,  x:'Те саме, зниження кількості шлаку на кожні 10 кг/т чавуну', c:'p', st:10, u:'кг/т', pg:-0.35, pt:-0.46, pr:0.6},

{t:'R', n:'2', id:'2', g:null, x:'Підвищення витрати чистих (100 % Fe) металодобавок на кожні 10 кг/т чав.', c:'p', st:10, u:'кг/т', pg:-0.4, pt:-0.53, pr:0.6},

{t:'F', n:'3', s:3, x:'Зменшення витрати вапняку на кожні 10 кг/т чавуну'},
{t:'D', id:'3a', g:'3', x:'сирого вапняку',      c:'p', st:10, u:'кг/т', pg:-0.5, pt:-0.67, pr:0.5},
{t:'D', id:'3b', g:'3', x:'доломітизованого',     c:'p', st:10, u:'кг/т', pg:-0.4, pt:-0.53, pr:0.4},

{t:'R', n:'4', id:'4', g:null, x:'Зменшення вмісту фракції 5–0 мм в залізорудній шихті на кожен 1 %', c:'p', st:1, u:'%', pg:-0.5, pt:-0.67, pr:1.0},

// ─────────── ПАЛИВНА БАЗА ───────────
{t:'S', x:'Паливна база (п.5–10)'},

{t:'R', n:'5', id:'5', g:null, x:'Зменшення вмісту золи в коксі на кожен 1 %', c:'p', st:1, u:'%', pg:-1.3, pt:-1.74, pr:1.3},

{t:'F', n:'6', s:6, x:'Зменшення вмісту сірки в коксі на кожен 0,1 %'},
{t:'D', id:'6a', g:'6', x:'при [S] = 0,05 %', c:'p', st:0.1, u:'%', pg:-0.18, pt:-0.24, pr:0.18},
{t:'D', id:'6b', g:'6', x:'при [S] = 0,04 %', c:'p', st:0.1, u:'%', pg:-0.22, pt:-0.29, pr:0.22},
{t:'D', id:'6c', g:'6', x:'при [S] = 0,03 %', c:'p', st:0.1, u:'%', pg:-0.27, pt:-0.36, pr:0.27},
{t:'D', id:'6d', g:'6', x:'при [S] = 0,02 %', c:'p', st:0.1, u:'%', pg:-0.38, pt:-0.52, pr:0.38},
{t:'D', id:'6e', g:'6', x:'при [S] = 0,01 %', c:'p', st:0.1, u:'%', pg:-0.71, pt:-0.95, pr:0.71},

{t:'F', n:'7', s:6, x:'Підвищення міцності коксу на кожен 1 %: <small>(оновлена ред.)</small>'},
{t:'D', id:'7m', g:null,  x:'за показником M<sub>25</sub>',                          c:'p', st:1, u:'%', pg:-0.60, pt:-0.80, pr:0.60},
{t:'D', id:'7a', g:'7csr', x:'за показником CSR: в межах до 45 %',                   c:'p', st:1, u:'%', pg:-0.93, pt:-1.21, pr:0.52},
{t:'D', id:'7b', g:'7csr', x:'за показником CSR: в межах 45–52 %',                   c:'p', st:1, u:'%', pg:-0.54, pt:-0.70, pr:0.49},
{t:'D', id:'7c', g:'7csr', x:'за показником CSR: в межах 52–58 %',                   c:'p', st:1, u:'%', pg:-0.31, pt:-0.38, pr:0.43},
{t:'D', id:'7d', g:'7csr', x:'за показником CSR: в межах понад 58 %',                c:'p', st:1, u:'%', pg:-0.16, pt:-0.19, pr:0.35},

{t:'R', n:'8', id:'8', g:null, x:'Зменшення стирання коксу за показником M<sub>10</sub> на кожен 1 %', c:'p', st:1, u:'%', pg:-2.8, pt:-3.75, pr:2.8},

{t:'F', n:'9', s:3, x:'Зменшення вмісту в коксі (на кожен 1 %) фракції:'},
{t:'D', id:'9a', g:null, x:'+80 мм', c:'p', st:1, u:'%', pg:-0.2, pt:-0.27, pr:0.2},
{t:'D', id:'9b', g:null, x:'-25 мм', c:'p', st:1, u:'%', pg:-1.0, pt:-1.34, pr:1.0},

{t:'R', n:'10', id:'10', g:null, x:'Заміщення коксу шматковим антрацитом, кг/кг', c:'r', st:1, u:'кг/т', rv:0.9, rng:'0,8 – 1,0', pr:null},

// ─────────── СКЛАД ЧАВУНУ ───────────
{t:'S', x:'Технологічні параметри — склад чавуну (п.11–14)'},

{t:'R', n:'11', id:'11', g:null, x:'Зменшення вмісту кремнію в чавуні на кожен 0,1 %',   c:'p', st:0.1, u:'%', pg:-1.2, pt:-1.6, pr:1.2},
{t:'R', n:'12', id:'12', g:null, x:'Зменшення вмісту марганцю в чавуні на кожен 0,1 %',  c:'p', st:0.1, u:'%', pg:-0.2, pt:-0.26, pr:0.2},
{t:'R', n:'13', id:'13', g:null, x:'Зменшення вмісту фосфору в чавуні на кожен 0,1 %',   c:'p', st:0.1, u:'%', pg:-0.6, pt:-0.8, pr:0.6},

{t:'F', n:'14', s:11, x:'Підвищення вмісту сірки в чавуні:'},
{t:'C', x:'<em>У разі приходу сірки до 10 кг/т:</em>'},
{t:'D', id:'14a', g:'14', x:'від 0,04 до 0,05 %', c:'a', st:1, u:'кр.', ck:-3.3,  pr:0.6},
{t:'D', id:'14b', g:'14', x:'від 0,03 до 0,04 %', c:'a', st:1, u:'кр.', ck:-5.5,  pr:1.1},
{t:'D', id:'14c', g:'14', x:'від 0,02 до 0,03 %', c:'a', st:1, u:'кр.', ck:-11.0, pr:2.0},
{t:'D', id:'14d', g:'14', x:'від 0,01 до 0,02 %', c:'a', st:1, u:'кр.', ck:-33.0, pr:6.5},
{t:'C', x:'<em>У разі приходу сірки до 4 кг/т:</em>'},
{t:'D', id:'14e', g:'14', x:'від 0,04 до 0,05 %', c:'a', st:1, u:'кр.', ck:-1.3,  pr:0.25},
{t:'D', id:'14f', g:'14', x:'від 0,03 до 0,04 %', c:'a', st:1, u:'кр.', ck:-2.2,  pr:0.4},
{t:'D', id:'14g', g:'14', x:'від 0,02 до 0,03 %', c:'a', st:1, u:'кр.', ck:-4.4,  pr:0.8},
{t:'D', id:'14h', g:'14', x:'від 0,01 до 0,02 %', c:'a', st:1, u:'кр.', ck:-13.3, pr:2.5},

// ─────────── ДУТТЬОВІ ПАРАМЕТРИ ───────────
{t:'S', x:'Дуттьові параметри (п.15–17)'},

{t:'F', n:'15', s:18, x:'Підвищення температури дуття на кожні 10 °С у діапазонах:'},
{t:'D', id:'15a', g:'15', x:'800–900 °С',   c:'p', st:10, u:'°С', pg:-0.50, pt:-0.67, pr:0.50},
{t:'D', id:'15b', g:'15', x:'900–1000 °С',  c:'p', st:10, u:'°С', pg:-0.40, pt:-0.54, pr:0.40},
{t:'C', x:'<em>а) при концентрації кисню в дутті до 25 %</em>'},
{t:'D', id:'15c', g:'15', x:'1000–1100 °С', c:'p', st:10, u:'°С', pg:-0.30, pt:-0.40, pr:0.30},
{t:'D', id:'15d', g:'15', x:'1100–1200 °С', c:'p', st:10, u:'°С', pg:-0.28, pt:-0.38, pr:0.28},
{t:'D', id:'15e', g:'15', x:'1200–1300 °С', c:'p', st:10, u:'°С', pg:-0.25, pt:-0.34, pr:0.25},
{t:'D', id:'15f', g:'15', x:'1300–1400 °С', c:'p', st:10, u:'°С', pg:-0.22, pt:-0.29, pr:0.22},
{t:'C', x:'<em>б) при концентрації кисню в дутті 25–35 %</em>'},
{t:'D', id:'15g', g:'15', x:'1000–1100 °С', c:'p', st:10, u:'°С', pg:-0.25, pt:-0.34, pr:0.25},
{t:'D', id:'15h', g:'15', x:'1100–1200 °С', c:'p', st:10, u:'°С', pg:-0.22, pt:-0.29, pr:0.22},
{t:'D', id:'15i', g:'15', x:'1200–1300 °С', c:'p', st:10, u:'°С', pg:-0.20, pt:-0.27, pr:0.20},
{t:'D', id:'15j', g:'15', x:'1300–1400 °С', c:'p', st:10, u:'°С', pg:-0.18, pt:-0.24, pr:0.18},
{t:'C', x:'<em>в) при концентрації кисню в дутті 35–40 %</em>'},
{t:'D', id:'15k', g:'15', x:'1000–1100 °С', c:'p', st:10, u:'°С', pg:-0.20, pt:-0.27, pr:0.20},
{t:'D', id:'15l', g:'15', x:'1100–1200 °С', c:'p', st:10, u:'°С', pg:-0.18, pt:-0.24, pr:0.18},
{t:'D', id:'15m', g:'15', x:'1200–1300 °С', c:'p', st:10, u:'°С', pg:-0.16, pt:-0.21, pr:0.16},
{t:'D', id:'15n', g:'15', x:'1300–1400 °С', c:'p', st:10, u:'°С', pg:-0.14, pt:-0.19, pr:0.14},

{t:'F', n:'16', s:3, x:'Зменшення вологості дуття на кожен 1 г/м<sup>3</sup> при витраті дуття:'},
{t:'D', id:'16a', g:'16', x:'1500–1600 м<sup>3</sup>/т', c:'p', st:1, u:'г/м\u00B3', pg:-0.20, pt:-0.27, pr:0.14},
{t:'D', id:'16b', g:'16', x:'1000–1100 м<sup>3</sup>/т', c:'p', st:1, u:'г/м\u00B3', pg:-0.15, pt:-0.20, pr:0.06},

{t:'F', n:'17', s:5, x:'Збагачення дуття киснем на кожен 1 % (абс.) при концентрації:'},
{t:'D', id:'17a', g:'17', x:'до 25 %',  c:'p', st:1, u:'%', pg:0.50, pt:0.67, pr:2.0},
{t:'D', id:'17b', g:'17', x:'25–30 %',  c:'p', st:1, u:'%', pg:0.80, pt:1.07, pr:1.7},
{t:'D', id:'17c', g:'17', x:'30–35 %',  c:'p', st:1, u:'%', pg:1.10, pt:1.47, pr:1.4},
{t:'D', id:'17d', g:'17', x:'35–40 %',  c:'p', st:1, u:'%', pg:1.40, pt:1.88, pr:1.1},

// ─────────── ЗАМІНА КОКСУ ПАЛИВОМ ───────────
{t:'S', x:'Заміна коксу паливом (п.18–21)'},

{t:'F', n:'18', s:3, x:'Коефіцієнт заміни коксу коксовим газом при витраті:'},
{t:'D', id:'18a', g:'18', x:'до 200 м<sup>3</sup>/т',  c:'r', st:1, u:'м\u00B3/т', rv:0.45, pr:null},
{t:'D', id:'18b', g:'18', x:'200–300 м<sup>3</sup>/т', c:'r', st:1, u:'м\u00B3/т', rv:0.40, pr:null},

{t:'F', n:'19', s:5, x:'Коефіцієнт заміни коксу природним газом при витраті: <small>(оновл.)</small>'},
{t:'D', id:'19a', g:'19', x:'CSR &gt; 45 %, до 100 м<sup>3</sup>/т',   c:'r', st:1, u:'м\u00B3/т', rv:0.80, pr:null},
{t:'D', id:'19b', g:'19', x:'CSR &gt; 45 %, 100–150 м<sup>3</sup>/т',  c:'r', st:1, u:'м\u00B3/т', rv:0.60, pr:null},
{t:'D', id:'19c', g:'19', x:'CSR &gt; 45 %, 150–200 м<sup>3</sup>/т',  c:'r', st:1, u:'м\u00B3/т', rv:0.40, pr:null},
{t:'D', id:'19d', g:'19', x:'CSR &lt; 45 %, до 100 м<sup>3</sup>/т',   c:'r', st:1, u:'м\u00B3/т', rv:0.76, pr:null},

{t:'F', n:'20', s:17, x:'Коефіцієнт заміни коксу ПВП: <small>(оновлена ред.)</small>'},
{t:'C', x:'<em>Окремі марки:</em>'},
{t:'D', id:'20a', g:'20', x:'Yarrabee PCI (V=9,2), Австралія',        c:'r', st:1, u:'кг/т', rv:0.90, pr:null},
{t:'D', id:'20b', g:'20', x:'Peabody PCI (V=15,0), Австралія',        c:'r', st:1, u:'кг/т', rv:0.85, pr:null},
{t:'D', id:'20c', g:'20', x:'Baralaba PCI (V=11,4), Австралія',       c:'r', st:1, u:'кг/т', rv:0.85, pr:null},
{t:'D', id:'20d', g:'20', x:'Conuma PCI (V=17,5), Канада',            c:'r', st:1, u:'кг/т', rv:0.80, pr:null},
{t:'D', id:'20e', g:'20', x:'Daunia PCI (V=20,2), Австралія',         c:'r', st:1, u:'кг/т', rv:0.80, pr:null},
{t:'D', id:'20f', g:'20', x:'Capricorn PCI (V=21,2), Австралія',      c:'r', st:1, u:'кг/т', rv:0.75, pr:null},
{t:'D', id:'20g', g:'20', x:'ESP OKD (V=23,8; A=8,5), Чехія',        c:'r', st:1, u:'кг/т', rv:0.75, pr:null},
{t:'C', x:'<em>Суміші з вугіллям ДГ ДТЕК (65/35):</em>'},
{t:'D', id:'20h', g:'20', x:'Yarrabee PCI / ДГ ДТЕК = 65/35',        c:'r', st:1, u:'кг/т', rv:0.80, pr:null},
{t:'D', id:'20i', g:'20', x:'Peabody PCI / ДГ ДТЕК = 65/35',         c:'r', st:1, u:'кг/т', rv:0.75, pr:null},
{t:'D', id:'20j', g:'20', x:'Baralaba PCI / ДГ ДТЕК = 65/35',        c:'r', st:1, u:'кг/т', rv:0.75, pr:null},
{t:'D', id:'20k', g:'20', x:'Conuma PCI / ДГ ДТЕК = 65/35',          c:'r', st:1, u:'кг/т', rv:0.75, pr:null},
{t:'D', id:'20l', g:'20', x:'Daunia PCI / ДГ ДТЕК = 65/35',          c:'r', st:1, u:'кг/т', rv:0.70, pr:null},
{t:'D', id:'20m', g:'20', x:'Capricorn PCI / ДГ ДТЕК = 65/35',       c:'r', st:1, u:'кг/т', rv:0.70, pr:null},
{t:'D', id:'20n', g:'20', x:'ESP OKD / ДГ ДТЕК = 65/35',             c:'r', st:1, u:'кг/т', rv:0.70, pr:null},

{t:'F', n:'21', s:4, x:'Коефіцієнт заміни коксу подрібненим вугіллям:'},
{t:'D', id:'21a', g:'21', x:'антрацитом і пісним із вмістом золи до 10 %',  c:'r', st:1, u:'кг/т', rv:0.9, pr:null},
{t:'D', id:'21b', g:'21', x:'те саме, із вмістом золи 10–20 %',            c:'r', st:1, u:'кг/т', rv:0.8, pr:null},
{t:'D', id:'21c', g:'21', x:'газовим, із вмістом золи 10–20 %',            c:'r', st:1, u:'кг/т', rv:0.8, pr:null},

// ─────────── ТИСК ТА ІНТЕНСИВНІСТЬ ───────────
{t:'S', x:'Тиск та інтенсивність (п.22–23)'},

{t:'R', n:'22', id:'22', g:null, x:'Підвищення тиску газів під колошником на кожні 10 кПа (20–200 кПа надл. тиску)', c:'p', st:10, u:'кПа', pg:-0.20, pt:-0.27, pr:1.0},
{t:'R', n:'23', id:'23', g:null, x:'Підвищення інтенсивності ходу по руді, т/м<sup>3</sup>&middot;добу', c:'s', st:1, u:'т/м\u00B3\u00B7д', pg:0.3, pt:0.3, pr:0.7},

// ─────────── ОРГАНІЗАЦІЙНІ ФАКТОРИ ───────────
{t:'S', x:'Організаційні фактори (п.24–26)'},

{t:'R', n:'24', id:'24', g:null, x:'Зменшення часу простоїв на кожен 1 % <sup>2)</sup>',  c:'p', st:1, u:'%', pg:-0.50, pt:-0.67, pr:1.5},
{t:'R', n:'25', id:'25', g:null, x:'Зменшення часу тихого ходу на кожен 1 %',            c:'p', st:1, u:'%', pg:-0.50, pt:-0.67, pr:1.0},
{t:'R', n:'26', id:'26', g:null, x:'Зменшення випадків затримки випуску чавуну на кожен 1 % при середній тривалості затримки 0,5 інтервалу часу між суміжними випусками <sup>3)</sup>', c:'p', st:1, u:'%', pg:-0.05, pt:-0.067, pr:0.1},
];


// ====================================================================
//  ФОРМАТУВАННЯ ЧИСЕЛ
// ====================================================================

function fmt(n, showSign) {
    if (n == null) return '\u2014';
    if (showSign === undefined) showSign = true;
    var s = parseFloat(n.toFixed(4)).toString().replace('.', ',');
    if (showSign && n > 0) s = '+' + s;
    return s;
}

function fmtResult(n, decimals) {
    if (decimals === undefined) decimals = 2;
    var s = n.toFixed(decimals).replace('.', ',');
    if (n > 0) s = '+' + s;
    return s;
}


// ====================================================================
//  ПОБУДОВА ТАБЛИЦІ
// ====================================================================

function renderTable() {
    var tbody = document.getElementById('tbody');
    var html = '';

    for (var i = 0; i < DATA.length; i++) {
        var r = DATA[i];

        switch (r.t) {

        case 'S':
            html += '<tr class="section-row"><td colspan="6">' + r.x + '</td></tr>';
            break;

        case 'F':
            html += '<tr class="factor-header">'
                + '<td class="cb-cell"></td>'
                + '<td class="num-cell" rowspan="' + r.s + '">' + r.n + '</td>'
                + '<td class="factor-cell" colspan="4">' + r.x + '</td>'
                + '</tr>';
            break;

        case 'C':
            html += '<tr class="condition-row">'
                + '<td class="cb-cell"></td>'
                + '<td class="factor-cell" colspan="4">' + r.x + '</td>'
                + '</tr>';
            break;

        case 'D':
            html += buildDataRow(r, false);
            break;

        case 'R':
            html += buildDataRow(r, true);
            break;
        }
    }

    tbody.innerHTML = html;
}


function buildDataRow(r, hasNum) {
    var cls = 'data-row' + (hasNum ? ' standalone' : '');
    var h = '<tr class="' + cls + '" data-id="' + r.id + '">';

    // Чекбокс
    h += '<td class="cb-cell">'
       + '<input type="checkbox" data-id="' + r.id + '"'
       + (r.g ? ' data-group="' + r.g + '"' : '')
       + '></td>';

    // Номер (лише для standalone)
    if (hasNum) {
        h += '<td class="num-cell">' + r.n + '</td>';
    }

    // Назва фактору
    h += '<td class="factor-cell">' + r.x + '</td>';

    // Поле вводу
    h += '<td class="input-cell">'
       + '<input type="number" step="any" placeholder="' + (r.u || '') + '" data-id="' + r.id + '" tabindex="0">'
       + '</td>';

    // Витрата коксу
    h += '<td class="coke-cell">' + cokeDisplay(r) + '</td>';

    // Продуктивність
    h += '<td class="prod-cell">' + prodDisplay(r) + '</td>';

    h += '</tr>';
    return h;
}


function cokeDisplay(r) {
    switch (r.c) {
        case 'p':
            return '<span class="val-pg">' + fmt(r.pg) + '</span>'
                 + ' / '
                 + '<span class="val-pt">' + fmt(r.pt) + '</span>';
        case 'r':
            if (r.rng) return r.rng;
            var unit = (r.u === 'кг/т') ? 'кг/кг' : 'кг/м\u00B3';
            return fmt(r.rv, false) + ' ' + unit;
        case 'a':
            return fmt(r.ck);
        case 's':
            return fmt(r.pg);
    }
    return '';
}


function prodDisplay(r) {
    if (r.pr == null) return '\u2014';
    return fmt(r.pr);
}


// ====================================================================
//  РОЗРАХУНОК
// ====================================================================

function recalculate() {
    var usePut = document.getElementById('tech-select').value === 'pt';
    var baseCoke = parseFloat(document.getElementById('base-coke').value) || 450;

    var totalCokePct = 0;
    var totalProdPct = 0;
    var count = 0;

    var rows = document.querySelectorAll('.data-row');
    for (var i = 0; i < rows.length; i++) {
        var tr = rows[i];
        var id = tr.getAttribute('data-id');
        var cb = tr.querySelector('input[type="checkbox"]');
        var inp = tr.querySelector('input[type="number"]');
        var val = parseFloat(inp.value) || 0;

        // Візуальний стан
        if (cb.checked && val !== 0) {
            tr.classList.add('active');
        } else {
            tr.classList.remove('active');
        }

        if (!cb.checked || val === 0) continue;

        // Знайти дані фактора
        var rd = findData(id);
        if (!rd) continue;

        var dCoke = 0;
        var dProd = 0;
        var step = rd.st || 1;

        switch (rd.c) {
            case 'p': // pair
                var coeff = usePut ? rd.pt : rd.pg;
                dCoke = coeff * val / step;
                dProd = rd.pr * val / step;
                break;
            case 's': // single
                dCoke = rd.pg * val / step;
                dProd = rd.pr * val / step;
                break;
            case 'r': // replacement
                var saved = rd.rv * val;
                dCoke = -saved / baseCoke * 100;
                dProd = 0;
                break;
            case 'a': // absolute (кг/т → %)
                var cokeKg = rd.ck * val;
                dCoke = cokeKg / baseCoke * 100;
                dProd = rd.pr * val;
                break;
        }

        totalCokePct += dCoke;
        totalProdPct += dProd;
        count++;
    }

    updateResults(totalCokePct, totalProdPct, baseCoke, count);
}


function findData(id) {
    for (var i = 0; i < DATA.length; i++) {
        if (DATA[i].id === id) return DATA[i];
    }
    return null;
}


function updateResults(cokePct, prodPct, baseCoke, count) {
    var cokeKg = cokePct / 100 * baseCoke;
    var newCoke = baseCoke + cokeKg;

    var elCokePct = document.getElementById('r-coke-pct');
    var elCokeKg  = document.getElementById('r-coke-kg');
    var elCokeNew = document.getElementById('r-coke-new');
    var elProd    = document.getElementById('r-prod');
    var elCount   = document.getElementById('r-count');

    elCokePct.textContent = fmtResult(cokePct) + ' %';
    elCokeKg.textContent  = '(' + fmtResult(cokeKg, 1) + ' кг/т)';
    elCokeNew.textContent = newCoke.toFixed(1).replace('.', ',') + ' кг/т';
    elProd.textContent    = fmtResult(prodPct) + ' %';
    elCount.textContent   = count;

    // Кольорове кодування
    elCokePct.className = 'res-val ' + (cokePct < -0.005 ? 'negative' : cokePct > 0.005 ? 'positive' : 'neutral');
    elProd.className     = 'res-val ' + (prodPct > 0.005 ? 'negative' : prodPct < -0.005 ? 'positive' : 'neutral');
}


// ====================================================================
//  ОБРОБНИКИ ПОДІЙ
// ====================================================================

function attachHandlers() {
    var tbody = document.getElementById('tbody');

    // Делеговані обробники на tbody
    tbody.addEventListener('change', function(e) {
        if (e.target.type === 'checkbox') {
            onCheckboxChange(e.target);
        }
    });

    tbody.addEventListener('input', function(e) {
        if (e.target.type === 'number') {
            recalculate();
        }
    });

    // Клік по рядку перемикає чекбокс
    tbody.addEventListener('click', function(e) {
        var tr = e.target.closest('.data-row');
        if (!tr) return;
        // Не перемикати якщо клік на input або checkbox
        if (e.target.tagName === 'INPUT') return;
        var cb = tr.querySelector('input[type="checkbox"]');
        if (cb) {
            cb.checked = !cb.checked;
            onCheckboxChange(cb);
        }
    });

    // Технологія
    document.getElementById('tech-select').addEventListener('change', function() {
        setTechClass();
        recalculate();
    });

    // Базова витрата коксу
    document.getElementById('base-coke').addEventListener('input', recalculate);

    // Скинути все
    document.getElementById('btn-reset').addEventListener('click', resetAll);
}


function onCheckboxChange(cb) {
    var group = cb.getAttribute('data-group');

    // Взаємне виключення: зняти інші в групі
    if (cb.checked && group) {
        var all = document.querySelectorAll('input[type="checkbox"][data-group="' + group + '"]');
        for (var i = 0; i < all.length; i++) {
            if (all[i] !== cb) {
                all[i].checked = false;
            }
        }
    }

    recalculate();
}


function setTechClass() {
    var tech = document.getElementById('tech-select').value;
    document.body.classList.remove('tech-pg', 'tech-pt');
    document.body.classList.add('tech-' + tech);
}


function resetAll() {
    var cbs = document.querySelectorAll('#tbody input[type="checkbox"]');
    for (var i = 0; i < cbs.length; i++) cbs[i].checked = false;

    var nums = document.querySelectorAll('#tbody input[type="number"]');
    for (var i = 0; i < nums.length; i++) nums[i].value = '';

    recalculate();
}


// ====================================================================
//  ІНІЦІАЛІЗАЦІЯ
// ====================================================================

document.addEventListener('DOMContentLoaded', function() {
    setTechClass();
    renderTable();
    attachHandlers();
    recalculate();
});
