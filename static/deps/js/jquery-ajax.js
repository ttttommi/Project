// Коли html документ готовий (промальований)
$(document).ready(function () {
    // Беремо змінну елемент розмітки з id jq-notification для оповіщень від ajax
    var successMessage = $("#jq-notification");

    // Ловимо подію кліка по кнопці додати до кошика
    $(document).on("click", ".add-to-cart", function (e) {
        // Блокуємо його базову дію
        e.preventDefault();

        // Беремо елемент лічильника у значку кошика та беремо звідти значення
        var goodsInCartCount = $("#goods-in-cart-count");
        var cartCount = parseInt(goodsInCartCount.text() || 0);

        // Отримуємо id товару з атрибуту data-product-id
        var product_id = $(this).data("product-id");

        // З атрибуту href беремо посилання на контролер django
        var add_to_cart_url = $(this).attr("href");

        // Робимо post запит через ajax не перезавантажуючи сторінку
        $.ajax({
            type: "POST",
            url: add_to_cart_url,
            data: {
                product_id: product_id,
                csrfmiddlewaretoken: $("[name=csrfmiddlewaretoken]").val(),
            },
            success: function (data) {
                // Повідомлення
                successMessage.html(data.message);
                successMessage.fadeIn(400);
                // Через 7 секунд прибираємо повідомлення
                setTimeout(function () {
                    successMessage.fadeOut(400);
                }, 7000);

                // Збільшуємо кількість товарів у кошику (малюнок у шаблоні)
                cartCount++;
                goodsInCartCount.text(cartCount);

                // Змінюємо кошик на відповідь від django (новий відмальований фрагмент розмітки кошика)
                var cartItemsContainer = $("#cart-items-container");
                cartItemsContainer.html(data.cart_items_html);

            },

            error: function (data) {
                console.log("Помилка при додаванні товару в кошик");
            },
        });
    });




    // Ловимо подію кліка по кнопці видалити товар з кошика
    $(document).on("click", ".remove-from-cart", function (e) {
        // Блокуємо його базову дію
        e.preventDefault();

        // Беремо елемент лічильника у значку кошика та беремо звідти значення
        var goodsInCartCount = $("#goods-in-cart-count");
        var cartCount = parseInt(goodsInCartCount.text() || 0);

        // Отримуємо id кошик з атрибуту data-cart-id
        var cart_id = $(this).data("cart-id");
        // З атрибуту href беремо посилання на контролер django
        var remove_from_cart = $(this).attr("href");

        // Робимо post запит через ajax не перезавантажуючи сторінку
        $.ajax({

            type: "POST",
            url: remove_from_cart,
            data: {
                cart_id: cart_id,
                csrfmiddlewaretoken: $("[name=csrfmiddlewaretoken]").val(),
            },
            success: function (data) {
                // Повідомлення
                successMessage.html(data.message);
                successMessage.fadeIn(400);
                // Через 7 секунд прибираємо повідомлення
                setTimeout(function () {
                    successMessage.fadeOut(400);
                }, 7000);

                // Зменшуємо кількість товарів у кошику (малюнок)
                cartCount -= data.quantity_deleted;
                goodsInCartCount.text(cartCount);

                // Змінюємо кошик на відповідь від django (новий відмальований фрагмент розмітки кошика)
                var cartItemsContainer = $("#cart-items-container");
                cartItemsContainer.html(data.cart_items_html);

            },

            error: function (data) {
                console.log("Помилка при додаванні товару в кошик");
            },
        });
    });




    // Тепер + - кількості товару 
    // Обробник події для зменшення значення
    $(document).on("click", ".decrement", function () {
        // Беремо посилання на контролер django із атрибуту data-cart-change-url
        var url = $(this).data("cart-change-url");
        // Беремо id кошик з атрибуту data-cart-id
        var cartID = $(this).data("cart-id");
        // Шукаємо найближчий input з кількістю
        var $input = $(this).closest('.input-group').find('.number');
        // Беремо значення кількості товару
        var currentValue = parseInt($input.val());
        // Якщо кількості більше за одну, то тільки тоді робимо -1
        if (currentValue > 1) {
            $input.val(currentValue - 1);
            // Запускаємо функцію, визначену нижче
            // з аргументами (id картки, нова кількість, кількість зменшилася або додалася, url)
            updateCart(cartID, currentValue - 1, -1, url);
        }
    });

    // Обробник події для збільшення значення
    $(document).on("click", ".increment", function () {
        // Беремо посилання на контролер django із атрибуту data-cart-change-url
        var url = $(this).data("cart-change-url");
        // Беремо id кошик з атрибуту data-cart-id
        var cartID = $(this).data("cart-id");
        // Шукаємо найближчий input з кількістю
        var $input = $(this).closest('.input-group').find('.number');
        // Беремо значення кількості товару
        var currentValue = parseInt($input.val());

        $input.val(currentValue + 1);

        // Запускаємо функцію, визначену нижче
        // з аргументами (id картки, нова кількість, кількість зменшилася або додалася, url)
        updateCart(cartID, currentValue + 1, 1, url);
    });

    function updateCart(cartID, quantity, change, url) {
        $.ajax({
            type: "POST",
            url: url,
            data: {
                cart_id: cartID,
                quantity: quantity,
                csrfmiddlewaretoken: $("[name=csrfmiddlewaretoken]").val(),
            },

            success: function (data) {
                 // Повідомлення
                successMessage.html(data.message);
                successMessage.fadeIn(400);
                 // Через 7 секунд прибираємо повідомлення
                setTimeout(function () {
                     successMessage.fadeOut(400);
                }, 7000);

                // Змінюємо кількість товарів у кошику
                var goodsInCartCount = $("#goods-in-cart-count");
                var cartCount = parseInt(goodsInCartCount.text() || 0);
                cartCount += change;
                goodsInCartCount.text(cartCount);

                // Змінюємо вміст кошика
                var cartItemsContainer = $("#cart-items-container");
                cartItemsContainer.html(data.cart_items_html);

            },
            error: function (data) {
                console.log("Помилка при додаванні товару в кошик");
            },
        });
    }

    // Беремо з розмітки елемент по id - оповіщення від django
    var notification = $('#notification');
    // І через 7 секекунд прибираємо
    if (notification.length > 0) {
        setTimeout(function () {
            notification.alert('close');
        }, 7000);
    }

    // При натисканні на значок кошика відкриваємо спливаюче(модальне) вікно
    $('#modalButton').click(function () {
        $('#exampleModal').appendTo('body');

        $('#exampleModal').modal('show');
    });

    // Клік по кнопці закрити вікна кошика
    $('#exampleModal .btn-close').click(function () {
        $('#exampleModal').modal('hide');
    });

    // Обробник події радіокнопки вибору способу доставки
    $("input[name='requires_delivery']").change(function () {
        var selectedValue = $(this).val();
        // Приховуємо або відображаємо input введення адреси доставки
        if (selectedValue === "1") {
            $("#deliveryAddressField").show();
        } else {
            $("#deliveryAddressField").hide();
        }
    });
});