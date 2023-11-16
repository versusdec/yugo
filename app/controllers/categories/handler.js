define(['microcore', 'mst!categories/item', "/app/modules/confirm", "/app/modules/notify"], function (mc, item_view, confirm, notify) {

    mc.events.on('categories.remove', (category) => {
        confirm('Удалить категорию?', category.name, () => {
            mc.api.call('categories.remove', {id: parseInt(category.id)}).then(res => {
                if (res) {
                    notify('Категория удалена', 'Категория "' + category.name + '" успешно удалена');
                    mc.router.go('/categories/')
                } else
                    notify('Произошла ошибка', 'Категория используется')
            })
        })
    });

    return async ($scope, $params) => {
        let hash_params = mc.router.hash()
        let page = parseInt(hash_params.page) || 1
        let limit = parseInt(hash_params.limit) || 10

        let categories = await mc.api.call("categories.list", {
            limit: limit,
            offset: (page-1) * limit
        })

        if (categories.items.length) {
            $($scope).find('table > tbody').html('')
            for (let i in categories.items) {
                let item = categories.items[i]
                $($scope).find('table > tbody').append(await item_view(item))
            }
        } else {
            $($scope).find('table > tbody .loader').text("нет категорий")
        }

        mc.events.push('system:pagination.update', {
            id: 'categories',
            total: categories.total,
            limit: categories.limit,
            current: page
        })
    }
});