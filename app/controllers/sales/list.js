define(
    ["microcore", "mst!/sales/list", "app/modules/notify", "app/modules/confirm", "app/modules/suggests"],
    function (mc, view, notify, confirm)
{
    let filter = {};

    mc.events.on('sales.available.update',  async () => {
        if (!filter.merchant_id) {
            $('span[data-available]').text('Необходимо выбрать рекламодателя')
            $('#leads_sell')[0].disabled = true
        } else if(!filter.category) {
            $('span[data-available]').text('Необходимо выбрать категорию')
            $('#leads_sell')[0].disabled = true
        } else if(!filter.offer_id) {
            $('span[data-available]').text('Необходимо выбрать оффер')
            $('#leads_sell')[0].disabled = true
        } else {
            $('span[data-available]').text(await mc.api.call('leads.available', filter))
            if(!filter.quantity) {
                $('#leads_sell')[0].disabled = true
            } else {
                $('#leads_sell')[0].disabled = false
            }
        }
    })

    mc.events.on('sales.filter.region.change', async (selected) => {
        filter.region = selected.value && parseInt(selected.value) || null
        mc.events.push('sales.available.update')
    })

    mc.events.on('sales.filter.category.change', async (selected) => {
        filter.category = selected.value && parseInt(selected.value) || null
        mc.events.push('sales.available.update')
    })

    mc.events.on('sales.filter.source.change', async (selected) => {
        filter.source = selected.value && parseInt(selected.value) || null
        mc.events.push('sales.available.update')
    })

    mc.events.on('sales.filter.webmaster.change', async (selected) => {
        filter.webmaster_id = selected.value && parseInt(selected.value) || null
        mc.events.push('sales.available.update')
    })

    mc.events.on('sales.filter.merchant.change', async (selected) => {
        filter.merchant_id = selected.value && parseInt(selected.value) || null
        mc.events.push('sales.available.update')
    })

    mc.events.on('sales.filter.offer.change', async (selected) => {
        filter.offer_id = selected.value && parseInt(selected.value) || null
        mc.events.push('sales.available.update')
    })

    mc.events.on('sales.quantity.change', async (value) => {
        filter.quantity = value && parseInt(value) || null
        mc.events.push('sales.available.update')
    })

    mc.events.on('offers.suggest', async (value) => {
        filter.quantity = value && parseInt(value) || null
        mc.events.push('sales.available.update')
    })

    mc.events.on('leads.sell', (value) => {
        confirm('Вы уверены?', 'Вы хотите отправить ' + filter.quantity + ' лидов', async () => {
            let sold = await mc.api.call("leads.sell", filter)
            notify('Лиды отпралены', "\nОтправлено: "+sold+" лидов")
            setTimeout(() => {mc.events.push('sales.available.update')}, 1000)
        })
    })

    return function (params) {
        document.title =`${mc.i18n('sales.title')} | Yugo Platform`;
        let title = mc.i18n('sales.title')
        filter = {}

        let data = {
            title: title,
            user: mc.auth.get()
        }

        return view(data);
    }
});