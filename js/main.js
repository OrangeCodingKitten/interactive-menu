import { getDataStore } from './getDataStore.js'

let BASKET_DATA_STORE = [];

let ORDER_DATA_STORE = [];

const MENU_DATA_STORE = [];
const USER_LANG = document.documentElement.lang;
const MAIN_LANG = 'ru';
const currency = '₽';

const menuCardList = document.getElementById('menuCardList');

getDataStore()
    .then(menuList => {
        menuList.forEach(element => {
            MENU_DATA_STORE.push(element)
        });

        categoriesBtnsRender();

    })
    .catch(error => {
        console.log(error);
    })

const basketBtnOpen = document.querySelector('.basket-btn');
const basketBtnQuantity = document.querySelector('.basket-btn-quantity');
basketBtnQuantity.style.display = 'none';

const basketBtnClouse = document.querySelector('.basket-clouse-btn');

const basketBox = document.querySelector('.basket-box');

const btnSendOrder = document.getElementById('btnSendOrder');
const basketCostSpan = document.querySelector('.basket-cost-span');                // ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ КОТОРЫЕ ХРАНЯТСЯ В ДОКУМЕНТЕ

const wrapper = document.querySelector('.wrapper');


const btnYourOrder = document.querySelector('.btn-your-order');
const divYourOrder = document.querySelector('.div-your-order');
const yourOrderBtnClose = document.querySelector('.your-order-btn-close');
const yourOrderCost = document.querySelector('.your-order-cost');

const yourOrderCardsList = document.querySelector('.your-order-cards-list');

const btnPay = document.querySelector('.btn-pay');

btnPay.addEventListener('click', () => {
    console.log('клик');
    createDialogBox('reqestPaymentMethod', 'Выберите способ оплаты');
})

let activeCategory;
let tableNumber;
let orderNumberForTg;
let orderNumberForHtml;

basketBtnOpen.addEventListener('click', () => {
    basketBtnOpen.classList.toggle('move-left');
    basketBtnClouse.classList.toggle('show');
    basketBox.classList.toggle('show');
})

basketBtnClouse.addEventListener('click', () => {
    basketBtnOpen.classList.remove('move-left');
    basketBtnClouse.classList.remove('show');
    basketBox.classList.remove('show');
})





function categoriesBtnsRender() {
    const categoriesListDiv = document.getElementById('categoriesList');
    categoriesListDiv.innerHTML = '';
    const addedCategories = new Set();

    let isFirstCategory = true; // 🆕 добавили переменную, чтобы отследить первую кнопку

    MENU_DATA_STORE.forEach(menuItem => {
        const menuItemCategory = menuItem[`${USER_LANG}Category`];
        if (!addedCategories.has(menuItemCategory)) {
            const categoryBtn = document.createElement('button');
            categoryBtn.className = 'categories-btn';

            if (isFirstCategory === true) { // 🆕 если это первая категория
                categoryBtn.classList.add('categories-btn_active'); // 🆕 добавляем класс
                isFirstCategory = false; // 🆕 больше не первая
                categoriesCardsRender(menuItemCategory);
            }
            categoryBtn.textContent = menuItemCategory;
            categoriesListDiv.appendChild(categoryBtn);
            addedCategories.add(menuItemCategory);

            categoryBtn.addEventListener('click', () => {
                categoriesListDiv.querySelector('.categories-btn_active').classList.remove('categories-btn_active');
                categoryBtn.classList.add('categories-btn_active');
                categoriesCardsRender(menuItemCategory);
            })
        };
    });
}

function categoriesCardsRender(category) {
    activeCategory = category;
    console.log(category);
    menuCardList.innerHTML = '';

    MENU_DATA_STORE.forEach(menuItem => {

        if (Boolean(menuItem.inStore) == true && category == menuItem[`${USER_LANG}Category`]) {
            const menuCardDiv = document.createElement('div');
            menuCardDiv.className = 'card';
            menuCardDiv.dataset.id = menuItem.id;
            menuCardDiv.innerHTML = `
            <img class="card__photo" src="${menuItem.imgSrc}" alt="">
            <div class="card__text">
                <div class="card__info">
                    <h2>${menuItem[`${USER_LANG}Name`]}</h2>
                    <p>${menuItem[`${USER_LANG}Description`]}</p>
                </div>

                <div class="portions-list"></div>
            </div>
            `;
            const portionListDiv = menuCardDiv.querySelector('.portions-list');
            const portionListStore = [
                menuItem.portionName1,
                menuItem.portionName2,
                menuItem.portionName3,
                menuItem.portionName4,
                menuItem.portionName5
            ];

            portionListStore.forEach((portionName, index) => {
                if (portionName) {
                    const portionNumber = index + 1;
                    const portionCost = parseInt(menuItem[`portionCost${portionNumber}`]);
                    const portionId = `${menuItem.id} - ${portionName}`;
                    const portionItemDiv = document.createElement('div');
                    portionItemDiv.dataset.id = portionId;
                    portionItemDiv.className = 'portions-item';
                    let amaunt = 0;
                    const portionInBasket = BASKET_DATA_STORE.find(basketCard => basketCard.portionId == portionId);
                    if (portionInBasket) {
                        amaunt = portionInBasket.portionAmaunt;
                        menuCardDiv.classList.add('card_active');
                    }
                    portionItemDiv.innerHTML = `
                    <p class="portions-item__info">
                        <span class="portions-item__name">${portionName} -</span>
                        <span class="portions-item__cost">${portionCost}${currency}</span>
                    </p>
                    <div class="portions-item__buttons">
                        <button class="btn-minus"><i class="fa-solid fa-minus"></i></button>
                        <span class="amaunt">${amaunt}</span>
                        <button class="btn-plus"><i class="fa-solid fa-plus"></i></button>
                    </div>
                `;
                    const portionData = {
                        action: '',
                        cardId: menuItem.id,
                        portionId: portionId,
                        cardNameUserLang: `${menuItem[`${USER_LANG}Name`]}`,
                        cardNameMainLang: `${menuItem[`${MAIN_LANG}Name`]}`,
                        category: `${menuItem[`${MAIN_LANG}Category`]}`,
                        srcImg: menuItem.imgSrc,
                        buttonType: 'menu',
                        amauntSpan: portionItemDiv.querySelector('.amaunt'),
                        portionCost: portionCost,
                        portionName: portionName
                    };
                    const btnMinus = portionItemDiv.querySelector('.btn-minus');
                    const btnPlus = portionItemDiv.querySelector('.btn-plus');
                    btnMinus.addEventListener('click', () => {
                        portionData.action = 'minus';
                        updateBasket(portionData);

                        basketBtnQuantity.textContent = BASKET_DATA_STORE.length;
                    });
                    btnPlus.addEventListener('click', () => {
                        portionData.action = 'plus';
                        updateBasket(portionData);

                        basketBtnQuantity.textContent = BASKET_DATA_STORE.length;
                    });
                    portionListDiv.appendChild(portionItemDiv);
                }

            });


            menuCardList.appendChild(menuCardDiv);
        }
    })
}

function updateBasket(portionData) {
    const cardInMenu = menuCardList.querySelector(`[data-id="${portionData.cardId}"]`);
    console.log(cardInMenu);
    console.log(portionData);

    if (portionData.action == 'plus') {
        const portionCardInBasket = BASKET_DATA_STORE.find(basketCard => basketCard.portionId == portionData.portionId);
        if (portionCardInBasket) {
            portionCardInBasket.portionAmaunt++;
            portionData.amauntSpan.innerText = portionCardInBasket.portionAmaunt;
            if (portionData.buttonType == 'basket') {
                if (cardInMenu) {
                    const portionInCardMenu = cardInMenu.querySelector(`[data-id="${portionData.portionId}"]`);
                    if (portionInCardMenu) {
                        const amauntSpanInCardMenu = portionInCardMenu.querySelector('.amaunt');
                        if (amauntSpanInCardMenu) {
                            amauntSpanInCardMenu.innerText = portionCardInBasket.portionAmaunt;
                        }
                    }
                }
            }
        } else {
            const newCardInBasket = {
                cardId: portionData.cardId,
                portionId: portionData.portionId,
                cardNameUserLang: portionData.cardNameUserLang,
                cardNameMainLang: portionData.cardNameMainLang,
                category: portionData.category,
                srcImg: portionData.srcImg,
                portionAmaunt: 1,
                portionCost: portionData.portionCost,
                portionName: portionData.portionName
            };
            BASKET_DATA_STORE.push(newCardInBasket);
            portionData.amauntSpan.innerText = 1;
        }


        if (cardInMenu) {
            cardInMenu.classList.add('card_active');
        }
    } else { // if minus
        const portionCardInBasket = BASKET_DATA_STORE.find(basketCard => basketCard.portionId == portionData.portionId);
        if (portionCardInBasket) {
            portionCardInBasket.portionAmaunt--;
            portionData.amauntSpan.innerText = portionCardInBasket.portionAmaunt;
            if (portionData.buttonType == 'basket') {
                if (cardInMenu) {
                    const portionInCardMenu = cardInMenu.querySelector(`[data-id="${portionData.portionId}"]`);
                    if (portionInCardMenu) {
                        const amauntSpanInCardMenu = portionInCardMenu.querySelector('.amaunt');
                        if (amauntSpanInCardMenu) {
                            amauntSpanInCardMenu.innerText = portionCardInBasket.portionAmaunt;
                        }
                    }
                }
            }
            if (portionCardInBasket.portionAmaunt == 0) {
                BASKET_DATA_STORE = BASKET_DATA_STORE.filter(basketCard => basketCard.portionId != portionData.portionId);
                const copyIdCard = BASKET_DATA_STORE.find(basketCard => basketCard.cardId == portionData.cardId);

                if (!copyIdCard) {
                    cardInMenu.classList.remove('card_active');
                }
            }
        }
    }

    basketCardRender();
}

function basketCardRender() {
    const basketListDiv = document.querySelector('.basket-list-div');
    basketListDiv.innerHTML = '';

    let basketTotalCost = 0;

    BASKET_DATA_STORE.forEach(basketItem => {

        basketTotalCost += basketItem.portionCost * basketItem.portionAmaunt; // 

        const basketCardDiv = document.createElement('div');
        basketCardDiv.className = 'basket-card-div';
        basketCardDiv.dataset.id = basketItem.portionId;
        basketCardDiv.innerHTML = `
            <div class="basket-head">
                <img class="basket-card__photo" src="${basketItem.srcImg}" alt="">
                <div class="basket-card__manager">
                    <div class="basket-card__buttons">
                        <button class="btn-minus"><i class="fa-solid fa-minus"></i></button>
                        <span class="amaunt-span">${basketItem.portionAmaunt}</span>
                        <button class="btn-plus"><i class="fa-solid fa-plus"></i></button>
                    </div>
                    <span class="basket-card__total-cost">${basketItem.portionCost * basketItem.portionAmaunt}${currency}</span>
                </div>
            </div>
            <div class="basket-card-info">
                <div class="basket-card__info">
                    <h2>${basketItem.cardNameUserLang}</h2>
                    <h3>${basketItem.cardNameMainLang}</h3>
                    <p><span>${basketItem.portionName}</span>-<span>${basketItem.portionCost}${currency}</span></p>
                </div>
            </div>
        `;
        const btnPlus = basketCardDiv.querySelector('.btn-plus');
        const btnMinus = basketCardDiv.querySelector('.btn-minus');
        const amauntSpan = basketCardDiv.querySelector('.amaunt-span');

        const portionData = {
            action: '',
            cardId: basketItem.cardId,
            portionId: basketItem.portionId,
            cardNameUserLang: basketItem.cardNameUserLang,
            cardNameMainLang: basketItem.cardNameMainLang,
            category: basketItem.category,
            srcImg: basketItem.imgSrc,
            buttonType: 'basket',
            amauntSpan: amauntSpan,
            portionCost: basketItem.portionCost,
            portionName: basketItem.portionName
        };

        btnPlus.addEventListener('click', () => {
            portionData.action = 'plus';
            updateBasket(portionData);

            basketBtnQuantity.textContent = BASKET_DATA_STORE.length;
        });

        btnMinus.addEventListener('click', () => {
            portionData.action = 'minus';
            updateBasket(portionData);

            basketBtnQuantity.textContent = BASKET_DATA_STORE.length;
        });

        basketListDiv.appendChild(basketCardDiv);
    });

    console.log(basketTotalCost);

    basketCostSpan.innerText = `${basketTotalCost} ${currency}`;


    if (BASKET_DATA_STORE.length > 0) {
        btnSendOrder.style.display = "block";
        basketBtnOpen.classList.add('basket-btn_active');
        basketBtnQuantity.style.display = 'flex';
    } else {
        btnSendOrder.style.display = "none";
        basketBtnOpen.classList.remove('basket-btn_active');
        basketBtnQuantity.style.display = 'none';
    }
}



btnSendOrder.addEventListener('click', () => {
    if (ORDER_DATA_STORE.length > 0) {
        createMessageToTg('updateOrder');
    } else {
        if (typeof tableNumber === 'number') {
            console.log('Номер стола - это число');
        } else {
            createDialogBox('reqestTableNumber', 'Пожалуйста введите номер стола');
        }
    }
})

function createDialogBox(type, text) {
    wrapper.innerHTML = '';
    switch (type) {
        case 'reqestTableNumber': {
            const dialogBoxDiv = document.createElement('div');
            dialogBoxDiv.className = 'dialog-box';
            dialogBoxDiv.innerHTML = `
                <p>${text}</p>
                <input class="table-number-input" type="number" placeholder="№">
                <div class="dialog-box__buttons">
                    <button class="dialog-box__ok">Ок</button>
                    <button class="dialog-box__cansel">Отмена</button>
                </div>
            `
            const dialogBoxOk = dialogBoxDiv.querySelector('.dialog-box__ok');
            const dialogBoxCansel = dialogBoxDiv.querySelector('.dialog-box__cansel');
            const tableNumberInput = dialogBoxDiv.querySelector('.table-number-input');

            dialogBoxOk.addEventListener('click', () => {
                const inputValue = tableNumberInput.value.trim();
                const InputValueNumber = Number(inputValue);

                if (inputValue !== '' && Number.isInteger(InputValueNumber)) {
                    tableNumber = inputValue;
                    tableNumberInput.value = '';
                    wrapper.classList.remove('wrapper_active');

                    createMessageToTg('newOrder');

                    console.log('Номер стола: ' + tableNumber);
                } else {
                    dialogBoxDiv.querySelector('p').innerText = 'Пожалуйста, введите ЦЕЛОЕ число';
                }
            });


            dialogBoxCansel.addEventListener('click', () => {
                wrapper.classList.remove('wrapper_active')
            })

            wrapper.appendChild(dialogBoxDiv);
            wrapper.classList.add('wrapper_active');
            break
        };

        case 'reqestPaymentMethod': {
            const dialogBoxDiv = document.createElement('div');
            dialogBoxDiv.className = 'dialog-box';
            dialogBoxDiv.innerHTML = `
                <p>${text}</p>
                <div class="dialog-box__buttons">
                    <button class="dialog-box__ok cash">Наличные</button>
                    <button class="dialog-box__ok card">Карта</button>
                    <button class="dialog-box__cansel">Отмена</button>
                </div>
            `
            const dialogBoxCash = dialogBoxDiv.querySelector('.cash');
            const dialogBoxCard = dialogBoxDiv.querySelector('.card');
            const dialogBoxCansel = dialogBoxDiv.querySelector('.dialog-box__cansel');

            dialogBoxCash.addEventListener('click', () => {
                createMessageToTg('payment', 'Наличные');
            })

            dialogBoxCard.addEventListener('click', () => {
                createMessageToTg('payment', 'Карта');
            })

            dialogBoxCansel.addEventListener('click', () => {
                wrapper.classList.remove('wrapper_active')
            })

            wrapper.appendChild(dialogBoxDiv);
            wrapper.classList.add('wrapper_active');
            break
        }

        case 'preloader': {
            const dialogBoxDiv = document.createElement('div');
            dialogBoxDiv.className = 'dialog-box';
            dialogBoxDiv.innerHTML = `
            <!-- Minimal SVG Loader (no JS, styles inside SVG) -->
            <svg width="64" height="64" viewBox="0 0 44 44" role="img" aria-label="Загрузка…"
                 xmlns="http://www.w3.org/2000/svg">
              <title>${text}</title>
              <style>
                /* Цвета можно поменять здесь */
                .track { stroke: #e6e6e6; }
                .arc   { stroke: #111111; }
            
                .track, .arc {
                  fill: none;
                  stroke-width: 4;
                }
            
                /* Центр вращения корректный для SVG */
                .arc {
                  stroke-linecap: round;
                  stroke-dasharray: 80 200;        /* короткая дуга + пустота */
                  transform-box: fill-box;
                  transform-origin: 50% 50%;
                  animation: spin 1.1s linear infinite, dash 1.5s ease-in-out infinite;
                }
            
                /* Плавное вращение */
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
            
                /* Лёгкое «дыхание» дуги */
                @keyframes dash {
                  0%   { stroke-dasharray: 10 270; stroke-dashoffset: 0; }
                  50%  { stroke-dasharray: 80 200; stroke-dashoffset: -40; }
                  100% { stroke-dasharray: 10 270; stroke-dashoffset: -280; }
                }
            
                /* Уважение к пользователям с reduced motion */
                @media (prefers-reduced-motion: reduce) {
                  .arc { animation: none; }
                }
              </style>
            
              <!-- Фоновое кольцо (можно убрать, если нужен совсем минимализм) -->
              <circle class="track" cx="22" cy="22" r="18" opacity="0.25"/>
              <!-- Активная дуга -->
              <circle class="arc"   cx="22" cy="22" r="18"/>
            </svg>
            
            `

            wrapper.appendChild(dialogBoxDiv);
            wrapper.classList.add('wrapper_active');
            break
        }

        case 'info': {
            const dialogBoxDiv = document.createElement('div');
            dialogBoxDiv.className = 'dialog-box';
            dialogBoxDiv.innerHTML = `
                <p>${text}</p>
                <button class="dialog-box__cansel">Ок</button>
            `

            const dialogBoxCansel = dialogBoxDiv.querySelector('.dialog-box__cansel');

            dialogBoxCansel.addEventListener('click', () => {
                wrapper.classList.remove('wrapper_active')
            })

            wrapper.appendChild(dialogBoxDiv);
            wrapper.classList.add('wrapper_active');
            break
        }

        case 'finalMessage': {
            const dialogBoxDiv = document.createElement('div');
            dialogBoxDiv.className = 'dialog-box';
            dialogBoxDiv.innerHTML = `
                <p>${text}</p>
                <button class="dialog-box__cansel">Ок</button>
            `

            const dialogBoxCansel = dialogBoxDiv.querySelector('.dialog-box__cansel');

            dialogBoxCansel.addEventListener('click', () => {
                wrapper.classList.remove('wrapper_active')
            })

            wrapper.appendChild(dialogBoxDiv);
            wrapper.classList.add('wrapper_active');
            break
        }

        default:
            break;
    }

}

function createMessageToTg(type, paymentMethod = null) {
    let messageTitle = ``;
    let messageHead = ``;
    let messageBody = ``;
    let messageFooter = ``;

    switch (type) {
        case 'newOrder': {
            createOrderNumber();
            messageTitle = `🔴Новый заказ`;
            messageHead = `
Язык посетителя - ${USER_LANG}
Номер стола - ${tableNumber}
Номер заказа - ${orderNumberForTg}
            `;
            messageBody = `📃 Список блюд:`;
            let numberBasketItem = 0;
            let basketTotalCost = 0;
            BASKET_DATA_STORE.forEach(basketItem => {
                numberBasketItem++;
                const basketItemName = basketItem.cardNameMainLang;
                const basketItemCategory = basketItem.category;
                const basketItemPortionName = basketItem.portionName;
                const basketItemAmaunt = basketItem.portionAmaunt;
                const basketItemCost = basketItem.portionCost * basketItemAmaunt;
                messageBody += `
${numberBasketItem}. ${basketItemName} (${basketItemCategory})
${basketItemPortionName} × ${basketItemAmaunt} = ${basketItemCost}${currency}
                `
                basketTotalCost += basketItemCost;
            });
            messageFooter = `
💰 Стоимость заказа: ${basketTotalCost}${currency}
                `;
            let fullMessageText = `
${messageTitle}
${messageHead}
${messageBody}
${messageFooter}
                `
            console.log(fullMessageText);
            sendMessangeToTg(fullMessageText, type);

            break;

        }

        case 'updateOrder': {
            messageTitle = `🟡Обновление заказа`;
            messageHead = `
Язык посетителя - ${USER_LANG}
Номер стола - ${tableNumber}
Номер заказа - ${orderNumberForTg}
            `;
            messageBody = `📃 Список блюд:\n`;
            messageBody += '\n🟨 Прошлые блюда:\n'
            let numberPortionItem = 0;
            let TotalCost = 0;

            ORDER_DATA_STORE.forEach(orderItem => {
                numberPortionItem++;
                const orderItemName = orderItem.cardNameMainLang;
                const orderItemCategory = orderItem.category;
                const orderItemPortionName = orderItem.portionName;
                const orderItemAmaunt = orderItem.portionAmaunt;
                const orderItemCost = orderItem.portionCost * orderItem.portionAmaunt;
                messageBody += `
${numberPortionItem}. ${orderItemName} (${orderItemCategory})
${orderItemPortionName} × ${orderItemAmaunt} = ${orderItemCost}${currency}
                `
                TotalCost += orderItemCost;
            });

            messageBody += '\n🟩 Новые блюда:\n'

            BASKET_DATA_STORE.forEach(basketItem => {
                numberPortionItem++;
                const basketItemName = basketItem.cardNameMainLang;
                const basketItemCategory = basketItem.category;
                const basketItemPortionName = basketItem.portionName;
                const basketItemAmaunt = basketItem.portionAmaunt;
                const basketItemCost = basketItem.portionCost * basketItemAmaunt;
                messageBody += `
${numberPortionItem}. ${basketItemName} (${basketItemCategory})
${basketItemPortionName} × ${basketItemAmaunt} = ${basketItemCost}${currency}
                `
                TotalCost += basketItemCost;
            });
            messageFooter = `
💰 Стоимость заказа: ${TotalCost}${currency}
                `;
            let fullMessageText = `
${messageTitle}
${messageHead}
${messageBody}
${messageFooter}
                `
            console.log(fullMessageText);
            sendMessangeToTg(fullMessageText, type);

            break;
        }

        case 'payment': {
            createOrderNumber();
            messageTitle = `🟢Оплата заказа`;
            messageHead = `
Язык посетителя - ${USER_LANG}
Номер стола - ${tableNumber}
Тип оплаты - ${paymentMethod}
Номер заказа - ${orderNumberForTg}
            `;
            messageBody = `📃 Список блюд:`;
            let numberPortionItem = 0;
            let TotalCost = 0;

            ORDER_DATA_STORE.forEach(orderItem => {
                numberPortionItem++;
                const orderItemName = orderItem.cardNameMainLang;
                const orderItemCategory = orderItem.category;
                const orderItemPortionName = orderItem.portionName;
                const orderItemAmaunt = orderItem.portionAmaunt;
                const orderItemCost = orderItem.portionCost * orderItem.portionAmaunt;
                messageBody += `
${numberPortionItem}. ${orderItemName} (${orderItemCategory})
${orderItemPortionName} × ${orderItemAmaunt} = ${orderItemCost}${currency}
                `
                TotalCost += orderItemCost;
            });
            messageFooter = `
💰 Стоимость заказа: ${TotalCost}${currency}
                `;
            let fullMessageText = `
${messageTitle}
${messageHead}
${messageBody}
${messageFooter}
                `
            console.log(fullMessageText);
            sendMessangeToTg(fullMessageText, type, TotalCost);



            break;
        }

        default:
            break;
    }
}




function createOrderNumber() {
    // Создаём объект Date с текущими датой и временем
    const now = new Date();
    console.log(now);


    // Получаем день, месяц, год
    const day = now.getDate();
    const month = now.getMonth() + 1; // Месяцы начинаются с 0 (январь — 0, декабрь — 11)
    const year = now.getFullYear();

    // Получаем часы, минуты, секунды
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // Форматируем день, месяц, год с ведущими нулями
    const formattedDay = day < 10 ? '0' + day : day;
    const formattedMonth = month < 10 ? '0' + month : month;
    const formattedYear = year;  // Год всегда 4 цифры

    // Форматируем время с ведущими нулями
    const formattedHours = hours < 10 ? '0' + hours : hours;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;

    orderNumberForTg = `#N${formattedDay}_${formattedMonth}_${formattedYear}__${formattedHours}_${formattedMinutes}_${formattedSeconds}__${tableNumber}`;
    orderNumberForHtml = `${formattedDay}.${formattedMonth}.${formattedYear} ${formattedHours}:${formattedMinutes}:${formattedSeconds} ${tableNumber}`

    console.log(orderNumberForTg);
    console.log(orderNumberForHtml);
}

function sendMessangeToTg(text, type, totalCost = 0) {
    createDialogBox('preloader', 'Отправка...');

    setTimeout(() => {
        const token = '8160508697:AAFJDed_MsKSYqDUgxQUDmiOJ_e-4oSc6Hw';
        const chatId = '7705038030';
        const url = `https://api.telegram.org/bot${token}/sendMessage`;

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: text
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.ok) {
                    if(type === 'payment') {
                        ORDER_DATA_STORE = [];
                        divYourOrder.style.display = 'none';
                        btnYourOrder.style.display = 'none';
                        createDialogBox('finalMessage', `Сейчас к вам подойдет офицант. Сумма к оплате: ${totalCost}${currency}. Не забудьте оставить отзыв.`)
                    } else {
                        BASKET_DATA_STORE.forEach(cardInfo => {
                            cardInfo.time = nowTime();
                        });
                        ORDER_DATA_STORE.unshift(...BASKET_DATA_STORE);
                        BASKET_DATA_STORE = [];
                        createDialogBox('info', 'Ваш заказ отправлен')
                    }
                    basketCardRender();
                    categoriesCardsRender(activeCategory);
                    orderRender();
                } else {
                    console.error('Ошибка при отправке:', data);
                    createDialogBox('info', 'Ошибка при отправке. Попробуйте ещё раз')
                }
            })
            .catch(error => {
                console.error('Ошибка запроса:', error);
                createDialogBox('info', 'Отправка заказа временно недоступна. Пожалуйста, пригласите офицанта.')
            });
    }, 500);
}

btnYourOrder.onclick = function () {
    divYourOrder.style.display = 'flex';
}

yourOrderBtnClose.onclick = function () {
    divYourOrder.style.display = 'none';
}




function orderRender() {
    yourOrderCardsList.innerHTML = '';


    let orderTotalCost = 0;
    ORDER_DATA_STORE.forEach(cardInfo => {
        console.log(cardInfo);

        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = `
        <div class="order-head">
            <img class="order-card__photo" src="${cardInfo.srcImg}" alt="">
            <div class="order-card__manager">
                <span class="order-amaunt-span">${cardInfo.portionAmaunt}</span>
                <span class="order-card__total-cost">${cardInfo.portionCost * cardInfo.portionAmaunt}${currency}</span>
            </div>
        </div>
        <div class="order-card__info">
            <h2>${cardInfo.cardNameUserLang}</h2>
            <h3>${cardInfo.cardNameMainLang}</h3>
            <p><span>${cardInfo.portionName}</span> - <span>${cardInfo.portionCost}${currency}</span></p>
            <span class="order-time">${cardInfo.time}</span>
        </div>
        `
        yourOrderCardsList.appendChild(orderCard);

        orderTotalCost += cardInfo.portionCost * cardInfo.portionAmaunt;
    });

    if (ORDER_DATA_STORE.length > 0) {
        btnYourOrder.textContent = `Ваш заказ: ${orderNumberForHtml}`
        btnYourOrder.style.display = 'block';
    }

    yourOrderCost.textContent = `Стоимость всех блюд: ${orderTotalCost}${currency}`
}

function nowTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const formattedHours = hours < 10 ? '0' + hours : hours;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${formattedHours}:${formattedMinutes}`;
}