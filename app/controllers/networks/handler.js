define(['microcore', 'mst!networks/item', "/app/modules/confirm", "/app/modules/notify"],
    function (mc, item_view, confirm, notify) {

    mc.events.on('networks.archive', (network) => {
        confirm('Удалить сеть?', network.name, () => {
            mc.api.call('networks.archive', {id: parseInt(network.id)}).then(res => {
                if (res) {
                    notify('Сеть удалена', 'Сеть "' + network.name + '" успешно удалена');
                    mc.router.go('/networks/')
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

        let networks = await mc.api.call("networks.list", {
            limit: limit,
            offset: (page-1) * limit
        })

        if (networks.items.length) {
            $($scope).find('table > tbody').html('')
            for (let i in networks.items) {
                let item = networks.items[i]
                $($scope).find('table > tbody').append(await item_view(item))
            }
        } else {
            $($scope).find('table > tbody .loader').text("нет сетей")
        }

        mc.events.push('system:pagination.update', {
            id: 'networks',
            total: networks.total,
            limit: networks.limit,
            current: page
        })
    }
});