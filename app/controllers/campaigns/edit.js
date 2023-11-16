define(
    ["microcore", "mst!/campaigns/edit", "mst!/leads/edit/tag", "mst!campaigns/inbound", "app/modules/notify", "app/modules/suggests"],
    function (mc, view, tag_view, inbound_view, notify
    ) {
        let item = {}

        function field_error(field, tab) {
            $('ul.tabs li a')[tab].click()
            $(field).addClass('error')
            setTimeout(() => {
                $(field).removeClass('error')
            }, 3000)
            return false
        }

        mc.events.on('sys:page.init:campaigns/edit', () => {
            $('button[data-type]').on('click', (e) => {
                let profile = mc.auth.get();
                let type = e.target.dataset.type;

                if (type === 'next') {
                    let $next = $($('ul.tabs li.active')[0].nextElementSibling)
                    $next.removeClass('disabled')
                    return $next.find('a')[0].click()
                }

                item.name = $('input[name=name]').val();
                if (!item.name.length) {
                    return field_error('[name=name]', 0)
                }
                if (!item.region_id){
                    return field_error('[name=region_id]', 0);
                }
                if (!item.category_id){
                    return field_error('[name=category_id]', 0);
                }
                if (!item.source_id){
                    return field_error('[name=source_id]', 0);
                }
                if (!item.merchant){
                    return field_error('[name=merchant]', 0);
                }
                if (profile.role == "admin"){
                    if (!item.webmaster_id){
                        return field_error('[name=webmaster_id]', 0);
                    }
                    if (!item.status){
                        return field_error('[name=status]', 0);
                    }
                }
                if (!item.offer_id){
                    return field_error('[name=offer_id]', 0);
                }
                item.outbound = $('input[name=outbound]').val()
                if (!item.outbound){
                    return field_error('[name=outbound]', 0)
                }
                if ($('.inbound > .option > span')[0]) {
                    item.inbound = $('.inbound > .option > span')[0].dataset.value;
                    if (!item.inbound) {
                        return field_error('select.inbound', 0)
                    }
                } else {
                    notify('Не выбран Номер Б', 'Ошибка оффер не содержит номеров ');
                    return ;
                }

                item.tags = [];
                $('#campaign-tags .tag').forEach( el => {
                    item.tags.push(Number(el.dataset.id));
                });

                mc.api.call('campaigns.' + type, item).then((res) => {
                    switch (type) {
                        case 'create':
                            if (Number(res)>0) {
                                notify('Кампания создана', 'Кампания "'+item.name+'" успешно создана')
                            } else {
                                notify('Кампания не создана', 'Ошибка при создании ' + item.name)
                            }
                            break;
                        case 'update':
                            if (Number(res)>0) {
                                notify('Кампания обновлена', 'Кампания #' + item.id + ' успешно обновлена')
                            } else {
                                notify('Кампания не изменилась', 'Кампания #' + item.id + ' не была изменена')
                            }

                            break;
                    }
                    mc.router.go('/campaigns/')
                });
            })
        });

        mc.events.on('campaign.region.change', async (selected) => {
            item.region_id = selected.value && parseInt(selected.value) || null
        })

        mc.events.on('campaign.category.change', async (selected) => {
            item.category_id = selected.value && parseInt(selected.value) || null
        })

        mc.events.on('campaign.source.change', async (selected) => {
            item.source_id = selected.value && parseInt(selected.value) || null
        })

        mc.events.on('campaign.merchant.change', async (selected) => {
            item.merchant = selected.value && parseInt(selected.value) || null
        })

        mc.events.on('campaign.webmaster.change', async (selected) => {
            item.webmaster_id = selected.value && parseInt(selected.value) || null
        })

        mc.events.on('campaign.offer.change', async (selected) => {
            item.offer_id = selected.value && parseInt(selected.value) || null;
            let div = $('.inbound-container')[0];
            $(div).html('');
            if (item.offer_id){
                let offer = await mc.api.call('offers.get', {id: item.offer_id});
                if (mc.auth.get()['role'] == "webmaster"){
                    item.merchant = parseInt(offer.merchant.id);
                }
                if (offer && offer.phones){
                    let phones = [];
                    try {
                        for(let phone of offer.phones){
                            phones.push({option: phone.phone, value: phone.phone});
                        }
                    }catch (ex){
                        console.log(ex.message);
                    }
                    $(div).append(await inbound_view({phones: phones, inbound: item.inbound}));
                }
            }
        })


        return async function (params) {
            let title = 'Создать кампанию'

            if (params.id == 'new') {
                document.title = "Создание | Кампании | Yugo Platform";
                item = {};
            } else {
                document.title = "Редактирование | Кампании | Yugo Platform";
                item = await mc.api.call('campaigns.get', {id: params.id})
                title = 'Редактирование кампании'
            }


            let data = {
                item: item,
                id: params.id,
                profile: mc.auth.get()
            }

            data.title = title;

            if (data.profile.role === "admin"){
                data.statuses = [
                    {option: 'активен', value: 'active'},
                    {option: 'заблокирован', value: 'inactive'}
                ];
            }

            data.region_set = async (id) => {
                let item = await mc.api.call('regions.get', {
                    id: id
                });
                return {
                    option: item.name,
                    value: item.id
                }
            };

            data.category_set = async (id) => {
                let item = await mc.api.call('categories.get', {
                    id: id
                });
                return {
                    option: item.name,
                    value: item.id
                }
            };

            data.source_set = async (id) => {
                let item = await mc.api.call('sources.get', {
                    id: id
                });
                return {
                    option: item.name,
                    value: item.id
                }
            };

            data.merchant_set = async (id) => {
                let item = await mc.api.call('users.get', {
                    id: id
                });
                return {
                    option: item.name,
                    value: item.id
                }
            };

            data.webmaster_set = async (id) => {
                let item = await mc.api.call('users.get', {
                    id: id
                });
                return {
                    option: item.name,
                    value: item.id
                }
            };

            data.offer_set = async (id) => {
                let offer = await mc.api.call('offers.get', {
                    id: id
                });
                mc.events.push('campaign.offer.change', {value: id});
                return {
                    option: offer.name,
                    value: offer.id
                }
            };

            data.tag_select = async (tag) => {
                if (tag.value && tag.value.length && !document.querySelector('#campaign-tags .tag[data-id="'+tag.value+'"]')) {
                    $('#campaign-tags').append(await tag_view({id: tag.value, name: tag.option}));
                }
                $('.autocomplete.tags .clear')[0].click();
            }

            data.tag_suggest = async (value) => {
                let data = await mc.api.call('tags.suggest', {
                    q: value
                });

                let items = [];

                for (let i in data.items) {
                    let item = data.items[i];
                    items.push({
                        option: item.name,
                        value: item.id
                    })
                }

                return items
            };

            data.status_change = (selected) => {
                item.status = selected.value
            };

            return view(data);
        }
    });