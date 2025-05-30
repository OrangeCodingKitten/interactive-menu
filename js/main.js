import { getDataStore } from './getDataStore.js'

let BASKET_DATA_STORE = [];
const MENU_DATA_STORE = [];
const USER_LANG = document.documentElement.lang;
const MAIN_LANG = 'ru';

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
const basketBtnClouse = document.querySelector('.basket-clouse-btn');

const basketBox = document.querySelector('.basket-box');

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
                        <span class="portions-item__cost">${portionCost}₽</span>
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
                    });
                    btnPlus.addEventListener('click', () => {
                        portionData.action = 'plus';
                        updateBasket(portionData);
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
    if (portionData.action == 'plus') {
        const portionCardInBasket = BASKET_DATA_STORE.find(basketCard => basketCard.portionId == portionData.portionId);
        if (portionCardInBasket) {
            portionCardInBasket.portionAmaunt++;
            portionData.amauntSpan.innerText = portionCardInBasket.portionAmaunt;
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
    } else {
        const portionCardInBasket = BASKET_DATA_STORE.find(basketCard => basketCard.portionId == portionData.portionId);
        if (portionCardInBasket) {
            portionCardInBasket.portionAmaunt--;
            portionData.amauntSpan.innerText = portionCardInBasket.portionAmaunt;
            if (portionCardInBasket.portionAmaunt == 0) {
                BASKET_DATA_STORE = BASKET_DATA_STORE.filter(basketCard => basketCard.portionId != portionData.portionId);
                const copyIdCard = BASKET_DATA_STORE.find(basketCard => basketCard.cardId == portionData.cardId);
                if (!copyIdCard) {
                    cardInMenu.classList.remove('card_active');
                }
            }
        }
    }
    console.log(BASKET_DATA_STORE);
    basketCardRender();
}

function basketCardRender() {
    const basketListDiv = document.querySelector('.basket-list-div');
    basketListDiv.innerHTML = '';
    BASKET_DATA_STORE.forEach(basketItem => {
        const basketCardDiv = document.createElement('div');
        basketCardDiv.className = 'basket-card-div';
        basketCardDiv.dataset.id = basketItem.portionId;
        basketCardDiv.innerHTML = `
            <div class="basket-head">
                <img class="basket-card__photo" src="${basketItem.srcImg}" alt="">
                <div class="basket-card__manager">
                    <div class="basket-card__buttons">
                        <button class="btn-minus"><i class="fa-solid fa-minus"></i></button>
                        <span>${basketItem.portionAmaunt}</span>
                        <button class="btn-plus"><i class="fa-solid fa-plus"></i></button>
                    </div>
                    <span class="basket-card__total-cost">${basketItem.portionCost * basketItem.portionAmaunt}₽</span>
                </div>
            </div>
            <div class="basket-card-info">
                <div class="basket-card__info">
                    <h2>${basketItem.cardNameUserLang}</h2>
                    <h3>${basketItem.cardNameMainLang}</h3>
                    <p><span>${basketItem.portionName}</span>-<span>${basketItem.portionCost}₽</span></p>
                </div>
            </div>
        `;
        basketListDiv.appendChild(basketCardDiv);
    });
}