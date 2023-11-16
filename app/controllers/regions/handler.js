define(['microcore', 'mst!regions/item', "/app/modules/confirm", "/app/modules/notify"], function (mc, item_view, confirm, notify) {

    mc.events.on('regions.archive', (region) => {
        confirm('Удалить регион?', region.name, () => {
            mc.api.call('regions.archive', {id: parseInt(region.id)}).then(res => {
                if (res) {
                    notify('Регион удален', 'Регион "' + region.name + '" успешно удален');
                    mc.router.go('/regions/')
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

        let regions = await mc.api.call("regions.list", {
            limit: limit,
            offset: (page-1) * limit
        })

        if (regions.items.length) {
            $($scope).find('table > tbody').html('')
            for (let i in regions.items) {
                let item = regions.items[i]
                $($scope).find('table > tbody').append(await item_view(item))
            }
        } else {
            $($scope).find('table > tbody .loader').text("нет регионов")
        }

        mc.events.push('system:pagination.update', {
            id: 'regions',
            total: regions.total,
            limit: regions.limit,
            current: page
        })
    }
});