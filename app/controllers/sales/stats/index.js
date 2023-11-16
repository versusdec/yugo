define(
    ["microcore", "mst!/sales/stats/index/admin", "mst!/sales/stats/index/merchant",
        "mst!/sales/stats/table/offers", "mst!/sales/stats/table/tags", "app/modules/notify", "app/modules/confirm", "app/modules/suggests"],
    function (mc, view_admin, view_merchant, table_offers_view, table_tags_view, notify, confirm)
    {
        let filter_offers = {}, filter_tags = {};

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

        async function loadStatsOffers(){
            let stats = await mc.api.call("sales.stats.offers", filter_offers);
            table_offers_view({stats_offers: stats, user: mc.auth.get()}).then((data) => {
                $("#offers .block.list")[0].innerHTML = data;
            });
        }
        async function loadStatsTags(){
            let stats = await mc.api.call("sales.stats.tags", filter_tags);
            table_tags_view({stats_tags: stats, user: mc.auth.get()}).then((data) => {
                $("#tags .block.list")[0].innerHTML = data;
            });
        }

        function comparer(idx, order = 'asc'){
            function getCell(tr, idx){
                return tr.children[idx].innerText || tr.children[idx].textContent
            }
            return (a, b) => (
                (v1, v2) => {
                    return v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2)
                }
            )(getCell(order == 'asc' ? a : b, idx), getCell(order == 'asc' ? b : a, idx));
        }

        mc.events.on('sales.stats.offers.range.start', (selected) => {
            filter_offers.start = selected.value;
        });
        mc.events.on('sales.stats.tags.range.start', (selected) => {
            filter_tags.start = selected.value;
        });

        mc.events.on('sales.stats.offers.range.finish', (selected) => {
            filter_offers.finish = selected.value;
        });
        mc.events.on('sales.stats.tags.range.finish', (selected) => {
            filter_tags.finish = selected.value;
        });

        mc.events.on('sales.stats.offers.region.change', async (selected) => {
            filter_offers.region = selected.value && parseInt(selected.value) || undefined
        })
        mc.events.on('sales.stats.tags.region.change', async (selected) => {
            filter_tags.region = selected.value && parseInt(selected.value) || undefined
        })

        mc.events.on('sales.stats.offers.category.change', async (selected) => {
            filter_offers.category = selected.value && parseInt(selected.value) || undefined
        })
        mc.events.on('sales.stats.tags.category.change', async (selected) => {
            filter_tags.category = selected.value && parseInt(selected.value) || undefined
        })

        mc.events.on('sales.stats.offers.source.change', async (selected) => {
            filter_offers.source = selected.value && parseInt(selected.value) || undefined
        })
        mc.events.on('sales.stats.tags.source.change', async (selected) => {
            filter_tags.source = selected.value && parseInt(selected.value) || undefined
        })

        mc.events.on('sales.stats.offers.webmaster.change', async (selected) => {
            filter_offers.user_id = selected.value && parseInt(selected.value) || undefined
        })
        mc.events.on('sales.stats.tags.webmaster.change', async (selected) => {
            filter_tags.user_id = selected.value && parseInt(selected.value) || undefined
        })

        mc.events.on('sales.stats.offers.merchant.change', async (selected) => {
            filter_offers.merchant_id = selected.value && parseInt(selected.value) || undefined
        })
        mc.events.on('sales.stats.tags.merchant.change', async (selected) => {
            filter_tags.merchant_id = selected.value && parseInt(selected.value) || undefined
        })

        mc.events.on('sales.stats.offers.offer.change', async (selected) => {
            filter_offers.offer_id = selected.value && parseInt(selected.value) || undefined
        })
        mc.events.on('sales.stats.tags.offer.change', async (selected) => {
            filter_tags.offer_id = selected.value && parseInt(selected.value) || undefined
        })

        mc.events.on('sales.stats.offers.tag.change', async (selected) => {
            filter_offers.tag = selected.value && parseInt(selected.value) || undefined
        })
        mc.events.on('sales.stats.tags.tag.change', async (selected) => {
            filter_tags.tag = selected.value && parseInt(selected.value) || undefined
        })

        mc.events.on("sales.stats.offers.filter.filter", async (button) => {
            //loadStatsOffers();
            for (let k in filter_offers){
                if (filter_offers[k] === undefined){
                    delete filter_offers[k];
                }
            }
            mc.router.go(mc.router.hash(filter_offers));
        });
        mc.events.on("sales.stats.tags.filter.filter", async (button) => {
            //loadStatsTags();
            for (let k in filter_tags){
                if (filter_tags[k] === undefined){
                    delete filter_tags[k];
                }
            }
            mc.router.go(mc.router.hash(filter_tags));
        });

        mc.events.on("sales.stats.offers.filter.reset", async (button) => {
            /*
            let user = mc.auth.get();
            filter_offers = {};
            $('#offers input[name=start]').val('');
            $('#offers input[name=finish]').val('');
            if (user.role && user.role === "admin") {
                $('#offers input[name=region]').val('');
                $('#offers input[name=region]')[0].dataset.value = '';
                $('#offers input[name=category]').val('');
                $('#offers input[name=category]')[0].dataset.value = '';
                $('#offers input[name=source]').val('');
                $('#offers input[name=source]')[0].dataset.value = '';
                $('#offers input[name=user_id]').val('');
                $('#offers input[name=user_id]')[0].dataset.value = '';
                $('#offers input[name=merchant]').val('');
                $('#offers input[name=merchant]')[0].dataset.value = '';
                $('#offers input[name=tag]').val('');
                $('#offers input[name=tag]')[0].dataset.value = '';
            }
            $('#offers input[name=offer_id]').val('');
            $('#offers input[name=offer_id]')[0].dataset.value = '';
            loadStatsOffers();
             */
            mc.router.go('/sales/stats/offers');
        });
        mc.events.on("sales.stats.tags.filter.reset", async (button) => {
            /*
            filter_tags = {};
            $('#tags input[name=start]').val('');
            $('#tags input[name=finish]').val('');
            $('#tags input[name=region]').val('');
            $('#tags input[name=region]')[0].dataset.value = '';
            $('#tags input[name=category]').val('');
            $('#tags input[name=category]')[0].dataset.value = '';
            $('#tags input[name=source]').val('');
            $('#tags input[name=source]')[0].dataset.value = '';
            $('#tags input[name=user_id]').val('');
            $('#tags input[name=user_id]')[0].dataset.value = '';
            $('#tags input[name=merchant]').val('');
            $('#tags input[name=merchant]')[0].dataset.value = '';
            $('#tags input[name=tag]').val('');
            $('#tags input[name=tag]')[0].dataset.value = '';
            $('#tags input[name=offer_id]').val('');
            $('#tags input[name=offer_id]')[0].dataset.value = '';
            loadStatsTags();
             */
            mc.router.go('/sales/stats/tags');
        });

        mc.events.on("sales.stats.sort", async (e) => {
            if (e.length == 2) {
                let table = $(e[0]).closest("table"), thead = table.find("thead"), th = $(e[0]).closest("th"), tbody = table.find("tbody");
                Array.from(tbody[0].querySelectorAll('tr'))
                    .sort(comparer(Array.from(th[0].parentNode.children).indexOf(th[0]), e[1]))
                    .forEach(tr => tbody[0].appendChild(tr));
                let spans = thead.find("span.sorted");
                for (let s of spans){
                    s.classList.remove("sorted");
                }
                e[0].classList.add("sorted");
            }
        });


        return async function (params) {
            document.title = "Статистика продаж | Yugo Platform";
            let title = 'Статистика продаж', profile = mc.auth.get();
            filter_offers = {}; filter_tags = {};

            let data = {
                title: title,
                user: mc.auth.get(),
                actions_options: [
                    {option: 'В работе', value: 'inwork'},
                    {option: 'Принят', value: 'approved'},
                    {option: 'Отклонен', value: 'rejected'},
                ],
                statuses_options: [
                    {option: 'Новый', value: 'new'},
                    {option: 'В работе', value: 'inwork'},
                    {option: 'Принят', value: 'approved'},
                    {option: 'Отклонен', value: 'rejected'},
                    {option: 'Апелляция', value: 'appealed'}
                ],
                tab: params.tab||'offers',
                region_set: async (id) => {
                    let item = await mc.api.call('regions.get', {id: id});
                    return {
                        option: item.name,
                        value: item.id
                    }
                },
                category_set: async (id) => {
                    let item = await mc.api.call('categories.get', {id: id});
                    return {
                        option: item.name,
                        value: item.id
                    }
                },
                source_set: async (id) => {
                    let item = await mc.api.call('sources.get', {id: id});
                    return {
                        option: item.name,
                        value: item.id
                    }
                },
                user_set: async (id) => {
                    let item = await mc.api.call('users.get', {id: id});
                    return {
                        option: item.name + ' ' + item.surname + ' (' + item.email + ') - ' + item.status,
                        value: item.id
                    }
                },
                offer_set: async (id) => {
                    let item = await mc.api.call('offers.get', {id: id});
                    return {
                        option: item.name,
                        value: item.id
                    }
                },
                tag_set: async (id) => {
                    let item = await mc.api.call('tags.get', {id: id});
                    return {
                        option: item.name,
                        value: item.id
                    }
                }
            };

            let hash = mc.router.hash();
            if (hash.start == undefined && hash.finish == undefined){
                let t = new Date(), m = t.getMonth()+1, d = t.getDate();
                hash.start = t.getFullYear()+'-'+(m<10?'0'+m:m)+'-'+(d<10?'0'+d:d);
            }

            if (params.tab === 'tags' && profile.role === "admin"){
                filter_tags = hash;
                data.filter_tags = filter_tags;
                data.stats_tags = await mc.api.call("sales.stats.tags", filter_tags);
            } else {
                filter_offers = hash;
                data.filter_offers = filter_offers;
                data.stats_offers = await mc.api.call("sales.stats.offers", filter_offers);
            }

            if (profile.role === "admin"){
                return view_admin(data);
            } else if (profile.role === "merchant"){
                return view_merchant(data);
            }
        }
    });