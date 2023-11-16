define(['microcore', 'mst!sales/list/upload', "/app/modules/confirm", "/app/modules/notify"],
    function (mc, view, confirm, notify) {
    let data = {}

    async function suggest(method, params, cb) {
        let data = await mc.api.call(method, params)

        let items = []

        for (let i in data.items) {
            let item = data.items[i]
            if (typeof cb == 'function') {
                items.push(cb(item))
            } else {
                items.push({
                    option: item.name,
                    value: item.id
                })
            }

        }

        return items
    }

    mc.events.on('sales.upload.file',  (files) => {
        data.files = []
        for (let i in files) {
            if (files[i].path) {
                data.files.push(files[i].path)
            }
        }
        $('#upload').removeClass('hide')
    })

    mc.events.on('regions.suggest', async (value) => {
        return await suggest('regions.suggest', {q: value})
    })

    mc.events.on('categories.suggest', async (value) => {
        return await suggest('categories.suggest', {q: value})
    })

    mc.events.on('sources.suggest', async (value) => {
        return await suggest('sources.suggest', {q: value})
    })

    mc.events.on('webmasters.suggest', async (value) => {
        return await suggest('users.suggest', {q: value, role: 'webmaster'}, function (item) {
            return {
                option: item.name + ' ' + item.surname + ' (' + item.email + ') - ' + item.status,
                value: item.id
            }
        })
    })

    mc.events.on('sales.upload.region.change', async (selected) => {
        data.region = selected.value
    })

    mc.events.on('sales.upload.category.change', async (selected) => {
        data.category = selected.value
    })

    mc.events.on('sales.upload.source.change', async (selected) => {
        data.source = selected.value
    })

    mc.events.on('sales.upload.webmaster.change', async (selected) => {
        data.user_id = selected.value
    })


    mc.events.on('sales.upload',  async () => {
        let stats = await mc.api.call("leads.upload", data)
        data = {}

        notify('Продажи загружены', "\nЗагружено всего: "+stats.total+" \n Добавлено: " + stats.added)
        $('div.upload[handler]').outerHTML = view()
        $('#upload').addClass('hide')
    })

    return async ($scope, $params) => {}
});