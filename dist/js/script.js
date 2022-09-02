document.addEventListener('DOMContentLoaded', () => {

    // clearActiveClass

    function clearActiveClass (arr, activeClass) {
        arr.forEach(item => {
            item.classList.remove(activeClass);
        });
    }

    // select

    function select (_el, fixedContentHeight, optionActiveClass) {
        const el = document.querySelector(_el);
        if (el) {
            const content = el.lastElementChild;
            let options = content.children;
            options = Array.prototype.slice.call(options);  // теперь options - массив
            let contentHeight = 0;
            options.forEach(item => {
              contentHeight += item.clientHeight;
            });
            function closeSelect () {
                el.classList.remove('select--active');
                content.style.maxHeight = '0px';
                document.removeEventListener('click', closeSelect);
            }
    
            options.forEach(item => {
                item.addEventListener('click', (e) => {
                  e.stopPropagation();
                  clearActiveClass (options, 'active');
                  item.classList.add(optionActiveClass);
                  el.firstElementChild.textContent = item.textContent;
                  closeSelect();
                  document.removeEventListener('click', closeSelect);
                });
            });
    
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                if (el.classList.contains('select--active')) {
                    closeSelect();
                } else {
                    el.classList.add('select--active');
                    if (fixedContentHeight) {
                        content.style.maxHeight = fixedContentHeight + 'px';
                    } else {
                        content.style.overflow = 'hidden';
                        content.style.maxHeight = contentHeight + 5 + 'px';
                    }
                    document.addEventListener('click', closeSelect);
                }
            });
        }
    }

    select('.select--1', 240, 'active');
    select('.select--2', false, 'active');
    select('.select--3', 240, 'active');
    select('.select--4', 240, 'active');
    select('.select--5', 240, 'active');
    select('.select--6', 240, 'active');

    // tabs

    function tabs (buttons, contents, activeClass) {
        const _buttons = document.querySelectorAll(buttons),
                _contents = document.querySelectorAll(contents);

        _buttons.forEach((btn, index1) => {
            btn.addEventListener('click', () => {
                clearActiveClass(_buttons, activeClass);
                clearActiveClass(_contents, activeClass);
                btn.classList.add(activeClass);
                _contents.forEach((content, index2) => {
                    if (index1 === index2) {
                        content.classList.add(activeClass);
                    }
                });
            });
        });
    }

    tabs('.master-calc__tabs__item', '.master-calc__tab-content', 'active');

    // калькулятор

    // Срок из select

    function term(element) {
        let term_;
        if (element.getAttribute('data-term') && element.getAttribute('data-term') !== 'null') {
            term_ = +element.getAttribute('data-term') / 12;
        } else {
            term_ = +element.textContent.replace(/\D/g, '');
        }
        return term_;
    }

    // вычисление платежа
    function getPayment(sum, period, rate) {
        // *
        // * sum - сумма кредита
        // * period - срок в годах
        // * rate - годовая ставка в процентах
        // * 
        let i,
            koef,
            payment;

        // ставка в месяц
        i = (rate / 12) / 100;

        // коэффициент аннуитета
        koef = (i * (Math.pow(1 + i, period * 12))) / (Math.pow(1 + i, period * 12) - 1);

        // итог
        payment = (sum * koef).toFixed();
        return payment;
    };

    // маска
    function prettify(num) {
        var n = num.toString();
        return n.replace(/(\d{1,3}(?=(?:\d\d\d)+(?!\d)))/g, "$1" + ' ');
    }

    // считаем кредит
    function sumResult(credit, inputPrice, inputContribution, invalid) {
        let result;
        result = +inputPrice.value.replace(/\D/g, '') - +inputContribution.value.replace(/\D/g, '');
        credit.textContent = prettify(result) + ' ₽';
        if (result < 0) {
            credit.textContent = '';
            invalid.textContent = 'Первоначальный взнос должен быть меньше стоимости!';
        } else {
            invalid.textContent = '';
        }
    }

    // собираем всё вместе и выводим результаты при вводе значений
    function calc(
        {
            maxPrice: _maxPrice,
            creditSumSelector: _sum,
            creditContributionSelector: _fee,
            creditTermSelector: _term,
            creditOptionSelector: _option,
            creditCreditSelector: _credit,
            creditPaymentSelector: _payment,
            creditInvalidSelector: _invalid,
            paymentNowInputSelector: _paymentNow,
            savingSelector: _saving,
            sumResult: _sumResult
        }) {
        const inputPrice = document.querySelector(_sum),
              inputContribution = document.querySelector(_fee),
              termElement = document.querySelector(_term),
              termsOptions = document.querySelectorAll(_option),
              credit = document.querySelector(_credit),
              payment = document.querySelector(_payment),
              paymentNow = document.querySelector(_paymentNow),
              saving = document.querySelector(_saving),
              invalid = document.querySelector(_invalid);
        
        // Считаем разницу

        function difference() {
            let diff;
            if (paymentNow.value.replace(/\D/g, '') - payment.textContent.replace(/\D/g, '') >= 0) {
                diff = paymentNow.value.replace(/\D/g, '') - payment.textContent.replace(/\D/g, '');
                saving.textContent = prettify(diff) + ' ₽';
            } else {
                saving.textContent = '';
            }
        }

        if (inputPrice) {
            
            inputPrice.addEventListener('input', function() {
                this.value = this.value.replace(/\D/g, '');
                this.value = prettify(this.value);
                if (this.value.replace(/\D/g, '') > _maxPrice) {
                    this.value = prettify(_maxPrice);
                }

                if (_sumResult) {
                    sumResult(credit, inputPrice, inputContribution, invalid);
                }
                if (credit) {
                    payment.textContent = prettify(getPayment(+credit.textContent.replace(/\D/g, ''), term(termElement), 5.5)) + ' ₽';
                } else {
                    payment.textContent = prettify(getPayment(+this.value.replace(/\D/g, ''), term(termElement), 5.5)) + ' ₽';
                }

                if (_paymentNow) {
                    difference();
                }

            });

            if (_sumResult) {
                inputContribution.addEventListener('input', function() {
                    this.value = this.value.replace(/\D/g, '');
                    this.value = prettify(this.value);
                    if (this.value.replace(/\D/g, '') > _maxPrice) {
                        this.value = prettify(_maxPrice);
                    }
                    
                    sumResult(credit, inputPrice, inputContribution, invalid);
        
                    payment.textContent = prettify(getPayment(+credit.textContent.replace(/\D/g, ''), term(termElement), 5.5)) + ' ₽';

                    if (_paymentNow) {
                        difference();
                    }
        
                });
            }

            termsOptions.forEach(option => {
                option.addEventListener('click', () => {
                    termElement.setAttribute('data-term', option.getAttribute('data-term'));

                    if (credit) {
                        payment.textContent = prettify(getPayment(+credit.textContent.replace(/\D/g, ''), term(termElement), 5.5)) + ' ₽';
                    } else {
                        payment.textContent = prettify(getPayment(+inputPrice.value.replace(/\D/g, ''), term(termElement), 5.5)) + ' ₽';
                    }

                    if (_paymentNow) {
                        difference();
                    }
                });
            });

            if (_paymentNow) {
                paymentNow.addEventListener('input', function () {
                    this.value = this.value.replace(/\D/g, '');
                    this.value = prettify(this.value);
                    difference();
                });
            }
        }

    };

    calc(
        {
            maxPrice: 100000000,
            creditSumSelector: '#sum3',
            creditContributionSelector: '#fee3',
            creditTermSelector: '#term3',
            creditOptionSelector: '.select__option--3',
            creditCreditSelector: '#credit3',
            creditPaymentSelector: '#payment3',
            creditInvalidSelector: '.master-calc__invalide',
            sumResult: true
        }
    );

    calc(
        {
            maxPrice: 100000000,
            creditSumSelector: '#sum1',
            creditTermSelector: '#term1',
            creditOptionSelector: '.select__option--1',
            creditPaymentSelector: '#payment1',
        }
    );

    calc(
        {
            maxPrice: 100000000,
            creditSumSelector: '#sum2',
            creditTermSelector: '#term2',
            creditOptionSelector: '.select__option--2',
            creditPaymentSelector: '#payment2',
            paymentNowInputSelector: '#paymentNow2',
            savingSelector: '#saving2'
        }
    );

    calc(
        {
            maxPrice: 100000000,
            creditSumSelector: '#sum4',
            creditTermSelector: '#term4',
            creditOptionSelector: '.select__option--4',
            creditPaymentSelector: '#payment4',
        }
    );

    // функция для модалки

    function calcScroll() {
        let div = document.createElement('div');
        
        div.style.width = '50px';
        div.style.height = '50px';
        div.style.overflowY = 'scroll';
        div.style.visibility = 'hidden';
        
        document.body.appendChild(div);
        let scarollWidth = div.offsetWidth - div.clientWidth;
        div.remove();
        
        return scarollWidth;
    }

    let scrollWidth = calcScroll();

    function modal(modal, modalActiveClass, triggers, modalClose) {
        const triggers_ = document.querySelectorAll(triggers),
                modal_ = document.querySelector(modal),
                modalClose_ = document.querySelector(modalClose);

        if (triggers_.length > 0) {
            triggers_.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    modal_.classList.add(modalActiveClass);
                    document.body.style.overflow = 'hidden';
                    document.body.style.marginRight = `${scrollWidth}px`;
                });
            });

            modalClose_.addEventListener('click', () => {
                modal_.classList.remove(modalActiveClass);
                document.body.style.overflow = '';
                document.body.style.marginRight = '0px';
            });
    
            modal_.addEventListener('click', (e) => {
                if (e.target.classList.contains(modal.replace(/\./, ''))) {
                    modal_.classList.remove(modalActiveClass);
                    document.body.style.overflow = '';
                    document.body.style.marginRight = '0px';
                }
            });
        }
    }

    modal('.modal-main', 'modal--active', '[data-modal]', '.modal-main__close');

});