define(["microcore"], function (mc) {
    async function suggest(method, params, cb) {
        let data = await mc.api.call(method, params)

        let items = []

        if (data && data.items && data.items.length) {
            for (let i in data.items) {
                let item = data.items[i]
                if (typeof cb == 'function') {
                    items.push(cb(item))
                } else {
                    items.push({
                        option: `${item.name} ${item.surname ? item.surname : ''} ${item.email ? ` (${item.email})` : ''}`,
                        value: item.id
                    })
                }
            }
        }

        return items
    }

    mc.events.on('regions.suggest', async (value) => {
        return await suggest('regions.suggest', {q: value})
    })

    mc.events.on('categories.suggest', async (value) => {
        return await suggest('categories.suggest', {q: value})
    })

    mc.events.on('sources.suggest', async (value) => {
        return await suggest('sources.suggest', {q: value})
    })

    mc.events.on('networks.suggest', async (value) => {
        return await suggest('networks.suggest', {q: value})
    });

    mc.events.on('agencies.suggest', async (value) => {
        return await suggest('agencies.suggest', {q: value})
        // return await suggest('agencies.suggest', {q: value, network_id: parseInt($('input[name="network_id"]')[0].dataset.value)})
    });

    mc.events.on('webmasters.suggest', async (value) => {
        return await suggest('users.suggest', {q: value, role: 'webmaster'}, function (item) {
            return {
                option: item.name + ' ' + item.surname + ' (' + item.email + ') - ' + item.status,
                value: item.id
            }
        })
    })

    mc.events.on('merchants.suggest', async (value) => {
        return await suggest('users.suggest', {q: value, role: 'merchant'}, function (item) {
            return {
                option: item.name + ' ' + item.surname + ' (' + item.email + ') - ' + item.status,
                value: item.id
            }
        })
    });

    mc.events.on('agencies.merchants.suggest', async (value) => {
        return await suggest('agencies.users.list', {q: value, role: 'merchant'}, function (item) {
            return {
                option: item.name + ' ' + item.surname + ' (' + item.email + ') - ' + item.status,
                value: item.id
            }
        })
    });

    mc.events.on('agency_managers.suggest', async (value) => {
        return await suggest('users.suggest', {q: value, role: 'agency_manager'}, function (item) {
            return {
                option: item.name + ' ' + item.surname + ' (' + item.email + ') - ' + item.status,
                value: item.id
            }
        })
    });

    mc.events.on('agency_admins.suggest', async (value) => {
        return await suggest('users.suggest', {q: value, role: 'agency_admin'}, function (item) {
            return {
                option: item.name + ' ' + item.surname + ' (' + item.email + ') - ' + item.status,
                value: item.id
            }
        })
    });

    mc.events.on('network_managers.suggest', async (value) => {
        return await suggest('users.suggest', {q: value, role: 'network_manager'}, function (item) {
            return {
                option: item.name + ' ' + item.surname + ' (' + item.email + ') - ' + item.status,
                value: item.id
            }
        })
    });

    mc.events.on('owners.suggest', async (value) => {
        return await suggest('users.suggest', {q: value, role: 'network_owner'}, function (item) {
            return {
                option: item.name + ' ' + item.surname + ' (' + item.email + ') - ' + item.status,
                value: item.id
            }
        })
    });

    mc.events.on('admins.suggest', async (value) => {
        return await suggest('users.suggest', {q: value, role: 'admin'}, function (item) {
            return {
                option: item.name + ' ' + item.surname + ' (' + item.email + ') - ' + item.status,
                value: item.id
            }
        })
    })

    mc.events.on('users.suggest', async (value) => {
        return await suggest('users.suggest', {q: value})

    })

    mc.events.on('offers.suggest', async (value) => {
        return await suggest('offers.suggest', {q: value/*, user_id: parseInt($('input[name="merchant"]')[0].dataset.value)*/})
    })

    mc.events.on('tags.suggest', async (value) => {
        return await suggest('tags.suggest', {q: value}, function (item) {
            return {
                option: item.name,
                value: item.id
            }
        })
    })
});