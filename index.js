class CalcError extends Error {
    constructor(msg) {
        super(`[Calc] ${msg}`);
        this.name = 'CalcError';
    }
}

const consts = {
    actions: {
        EQUAL: 0,
        PLUS: 1,
        MINUS: 2,
        MUL: 3,
        DIV: 4,
        SQRT: 5,
    }
}

const actions = [
    {
        id: consts.actions.PLUS,
        symbol: ' + ',
        func(a, b) {
            return a + b;
        }
    },
    {
        id: consts.actions.MINUS,
        symbol: ' - ',
        func(a, b) {
            return a - b;
        }
    },
    {
        id: consts.actions.MUL,
        symbol: ' * ',
        func(a, b) {
            return a * b;
        }
    },
    {
        id: consts.actions.DIV,
        symbol: ' / ',
        func(a, b) {
            return a / b;
        }
    },
    {
        id: consts.actions.SQRT,
        mono: true,
        func(a) {
            return Math.sqrt(a);
        }
    },
]

const findAction = (id) => actions.find(action => action.id === id);

class Calc {
    // Задание дефолтных значений
    constructor(elem) {
        this.elem = elem;
        this._firstNum = '';
        this._secondNum = '';
        this.lastArgs = {
            action: consts.actions.EQUAL,
            secondNum: '',
        };
        this.nowAction = consts.actions.EQUAL;

        this.render();
    }

    // Текст для последующего рендера
    getRenderedText() {
        let result = this.firstNum;

        if (this.nowAction === consts.actions.EQUAL) return result;

        const action = findAction(this.nowAction);
        if (action.mono) return result;

        result += action.symbol;

        if (this.secondNum) result += this.secondNum;

        return result;
    }

    // Рендер в элемент заданный при создании калькулятора
    render() {
        this.elem.innerText = this.getRenderedText();
    }

    // Установка действия
    setAction(actionId) {
        const action = findAction(actionId);
        if (!action) throw new CalcError('Undefined action');

        this.nowAction = actionId;

        if (action.mono) {
            return this.result();
        }

        this.render();
    }

    // набор геттеров/сеттеров для перерендера при каждом изменении
    set firstNum(newVal) {
        this._firstNum = newVal;
        this.render();
    }

    get firstNum() {
        return this._firstNum;
    }

    set secondNum(newVal) {
        this._secondNum = newVal;
        this.render();
    }

    get secondNum() {
        return this._secondNum;
    }

    // Получение чисел из строк
    getNormalNumbers() {
        const charNums = [this.firstNum, this.secondNum, this.lastArgs.secondNum];

        return charNums.map(numChar => numChar === '' ? null : Number(numChar));
    }

    // Очистка значений
    clear({ result = '', secondNum = '' , action = consts.actions.EQUAL }) {
        this.nowAction = consts.actions.EQUAL;
        this.firstNum = String(result);
        this.lastArgs.action = action;
        this.lastArgs.secondNum = String(secondNum);
        this.secondNum = '';
    }

    // Получить результат аналогично знаку равно
    result() {
        const nums = this.getNormalNumbers();

        let actionId = this.nowAction;
        let secondNum = nums[1];

        // Если нажата равно без иных действий
        if (this.nowAction === consts.actions.EQUAL) {
            // Если нажата равно, но действий еще не было, то ничего не делать
            if (this.lastArgs.action === consts.actions.EQUAL) return;

            actionId = this.lastArgs.action;
            secondNum = nums[2];
        }

        const action = findAction(actionId);

        const result = action.func(nums[0], action.mono ? null : secondNum);

        this.clear({
            result,
            secondNum,
            action: actionId,
        });

        this.render();
        return result;
    }

    // Установка конкретного значения для чисел,
    // в зависимости от текущего действия первое или второе
    setNums(num) {
        if (this.nowAction === consts.actions.EQUAL) this.firstNum = num;
        else this.secondNum = num;
    }

    // Добавление символов к числам к первому или второму
    // Схоже с предыдущим, но не заменяет, а дополняет число
    addChars(char) {
        if (this.nowAction === consts.actions.EQUAL) this.firstNum += char;
        else this.secondNum += char;
    }
}

const elem = document.getElementById('calc__display');

const calc = new Calc(elem);