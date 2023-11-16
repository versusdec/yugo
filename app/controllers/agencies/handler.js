define(['microcore', 'mst!agencies/item', "/app/modules/confirm", "/app/modules/notify"],
    function (mc, item_view, confirm, notify) {

    mc.events.on('agencies.archive', (agency) => {
        confirm('Удалить агентство?', agency.name, () => {
            mc.api.call('agencies.archive', {id: parseInt(agency.id)}).then(res => {
                if (res) {
                    notify('Агентство удалено', 'Агентство "' + agency.name + '" успешно удалено');
                    mc.router.go('/agencies/')
                } else {
                    notify('Произошла ошибка')
                }
            })
        })
    });

    return async ($scope, $params) => {
        let hash_params = mc.router.hash()
        let page = parseInt(hash_params.page) || 1
        let limit = parseInt(hash_params.limit) || 10

        let agencies = await mc.api.call("agencies.list", {
            limit: limit,
            offset: (page-1) * limit
        })

        if (agencies.items.length) {
            $($scope).find('table > tbody').html('')
            for (let i in agencies.items) {
                let item = agencies.items[i]
                $($scope).find('table > tbody').append(await item_view(item))
            }
        } else {
            $($scope).find('table > tbody .loader').text("нет агентств")
        }

        mc.events.push('system:pagination.update', {
            id: 'agencies',
            total: agencies.total,
            limit: agencies.limit,
            current: page
        })
    }
});