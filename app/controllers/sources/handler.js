define(['microcore', 'mst!sources/item', "/app/modules/confirm", "/app/modules/notify"], function (mc, item_view, confirm, notify) {

    mc.events.on('sources.remove', (source) => {
        confirm('Удалить источник?', source.name, () => {
            mc.api.call('sources.remove', {id: parseInt(source.id)}).then(res => {
                if (res) {
                    notify('Источник удален', 'Источник "' + source.name + '" успешно удален');
                    mc.router.go('/sources/')
                } else
                    notify('Произошла ошибка', 'Источник используется')
            })
        })
    });

    return async ($scope, $params) => {
        let hash_params = mc.router.hash()
        let page = parseInt(hash_params.page) || 1
        let limit = parseInt(hash_params.limit) || 10

        let sources = await mc.api.call("sources.list", {
            limit: limit,
            offset: (page-1) * limit
        })

        if (sources.items.length) {
            $($scope).find('table > tbody').html('')
            for (let i in sources.items) {
                let item = sources.items[i]
                $($scope).find('table > tbody').append(await item_view(item))
            }
        } else {
            $($scope).find('table > tbody .loader').text("нет источников")
        }

        mc.events.push('system:pagination.update', {
            id: 'sources',
            total: sources.total,
            limit: sources.limit,
            current: page
        })
    }
});