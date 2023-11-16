define([
    'microcore',
    'mst!billing/transactions/item',
    'mst!billing/transactions/topup',
    'mst!billing/transactions/transaction',
    'mst!billing/payments/popup',
    'mst!billing/payments/payment',
    'app/modules/popup',
    "app/modules/notify", "app/modules/confirm", "scripts", "app/modules/suggests"
], function (mc, item_view, topup, transaction, payments, payment, popup, notify, confirm, scripts) {

    let data = {amount: 0, type: 'yandex'};
    let payload = {}, page, filter = {}, hash = {};

    mc.events.on('transactions.show', () => {
        $('#transaction').removeClass('hide');
    });

    mc.events.on('topup.accept', async () => {
        if ($('#transaction .autocomplete input').val().length) {
            payload.user_id = parseInt($('#transaction .autocomplete input').attr('data-value'));
        } else {
            return scripts.fieldError('#transaction .autocomplete input')
        }
        if ($('#transaction [name=amount]').val().length) {
            payload.amount = parseInt($('#transaction [name=amount]').val());
        } else {
            return scripts.fieldError('[name=amount]')
        }
        payload.comment = $('[name=comment]').val();
        mc.api.call('transactions.add', payload).then(res => {
            if (res) {
                notify('Транзакция создана');
                mc.router.go('/billing/')
            } else {
                notify(mc.i18n('system.error'))
            }
        })
    });

    mc.events.on('transactions.filter.apply', async ($scope) => {
        let profile = mc.auth.get();
        filter.offset = (page - 1) * filter.limit;
        let transactions = await mc.api.call("transactions.list", filter);

        if (transactions && transactions.items) {
            $($scope).find('table > tbody').html('');
            if (transactions.items.length) {
                for (let i in transactions.items) {
                    let item = transactions.items[i];
                    item.profile = profile;
                    //item.classname = item.before < item.after ? 'success' : 'danger';
                    item.classname = item.amount > 0 ? 'success' : 'danger';
                    $($scope).find('table > tbody').append(await item_view(item))
                }
            }
        } else {
            $($scope).find('.loader').html(mc.i18n('table.empty'))
        }

        mc.events.push('system:pagination.update', {
            id: 'transactions',
            total: transactions.total || 0,
            limit: filter.limit || 10,
            current: page
        })
    });

    mc.events.on('transactions.filter.period.change', data => {
        if (data.value === '') {
            delete hash.period;
        } else {
            hash.period = data.value;
        }
    })

    mc.events.on('transactions.filter.change', async (selected) => {
        if (selected.value === 'select' || selected.option === '') {
            delete hash[selected.name]
        } else
            hash[selected.name] = selected.value
    });

    mc.events.on('transactions.filter.reset', async (button) => {
        mc.router.go(location.pathname);
    });

    mc.events.on("transactions.filter.filter", async ($scope) => {
        if (Object.keys(hash).length)
            mc.router.go(mc.router.hash(hash))
        else
            mc.router.go(location.pathname)
    });

    mc.events.on('transactions.export', async () => {
        let form = document.createElement("FORM");
        form.action = "/export/";
        form.method = "POST";
        form.style.visibility = "hidden";
        form.style.height = "1px";
        form.style.width = "1px";
        for (const key in filter) {
            if (filter[key] !== undefined && filter[key] !== null) {
                let input = document.createElement("INPUT");
                input.name = key;
                input.value = filter[key];
                form.appendChild(input);
            }
        }
        let input = document.createElement("INPUT");
        input.name = "method";
        input.value = "transactions.export";
        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    });

    return async function ($scope, $params) {
        hash = mc.router.hash();
        filter = hash;
        page = +hash.page || 1;
        filter.limit = +hash.limit || 10;
        filter.offset = (page - 1) * filter.limit;

        await mc.events.push('transactions.filter.apply', $scope);
    }
});