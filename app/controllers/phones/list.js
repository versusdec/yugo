define(
    ["microcore", "mst!/phones/list", "mst!/phones/popup", "/app/modules/confirm", "/app/modules/notify", "/app/modules/popup"],
    function (mc, view, popup_view, confirm, notify, popup
    ) {
        let user_id;

        mc.events.on('phones.popup.webmaster.change', async (selected) => {
            user_id = selected.value
        });

        mc.events.on('phones.remove', (phone) => {
            confirm('Удалить номер?', phone, () => {
                let phones = [];
                phones.push(phone);
                mc.api.call('phones.remove', {phones: phones}).then(res => {
                    if (res) {
                        notify('Номер удален', 'Номер "' + phone + '" успешно удален');
                        mc.router.go('/phones/')
                    } else
                        notify('Произошла ошибка')
                })
            })
        });

        mc.events.on('phones.check.all', (input) => {
            let table = input.closest('table');
            if (input.checked) {
                $(table).find('input[name=check]').forEach(e => {
                    e.checked = true
                })
            } else {
                $(table).find('input[name=check]').forEach(e => {
                    e.checked = false
                })
            }
        });

        mc.events.on('phones.status.apply', () => {
            let items = [];
            $('input[name=check]').forEach(e => {
                e.checked ? items.push(String(e.value)) : void 0;
            });
            if (items.length) {
                confirm('Подтвердите действие', `Применить статус?`, () => {
                    let status = $('span[data-name="status"]')[0].dataset.value;
                    mc.api.call('phones.status', {status: status, phones: items}).then((res) => {
                        if (res){
                            notify('Статус успешно изменен');
                            mc.router.go('/phones/')
                        } else {
                            notify('Произошла ошибка');
                        }
                    });
                });
            } else {
                notify('Ничего не выбрано');
            }
        });

        mc.events.on('phones.webmaster.attach', (button) => {
            user_id = null;
            popup(popup_view);
        });
        mc.events.on("phones.webmaster.apply", (button) => {
            let items = [];
            $('input[name=check]').forEach(e => {
                e.checked ? items.push(String(e.value)) : void 0;
            });
            if (items.length && user_id) {
                mc.api.call('phones.webmaster.attach', {user_id: user_id, phones: items}).then((res) => {
                    if (res) {
                        user_id = null;
                        $('.popup').remove();
                        notify('Вебмастер успешно привязан');
                        mc.router.go('/phones/')
                    } else {
                        notify('Произошла ошибка');
                    }
                });
            } else {
                notify('Ничего не выбрано');
            }
        });
        mc.events.on("phones.webmaster.detach", (button) => {
            let items = [];
            $('input[name=check]').forEach(e => {
                e.checked ? items.push(String(e.value)) : void 0;
            });
            if (items.length) {
                confirm('Подтвердите действие', `Отвязать вебмастера?`, () => {
                    mc.api.call('phones.webmaster.detach', {phones: items}).then((res) => {
                        if (res) {
                            notify('Вебмастер успешно отвязан');
                            mc.router.go('/phones/')
                        } else {
                            notify('Произошла ошибка');
                        }
                    });
                });
            } else {
                notify('Ничего не выбрано');
            }
        });

        mc.events.on('phones.chosen.remove', () => {
            let items = [];
            $('input[name=check]').forEach(e => {
                e.checked ? items.push(String(e.value)) : void 0;
            });
            if (items.length) {
                confirm('Удалить номера?', items.join(','), () => {
                    mc.api.call('phones.remove', {phones: items}).then(res => {
                        if (res) {
                            notify('Номера удалены', 'Номера "' + items.join(',') + '" успешно удалены');
                            mc.router.go('/phones/')
                        } else
                            notify('Произошла ошибка')
                    })
                });
            } else {
                notify('Ничего не выбрано');
            }
        });

        mc.events.on('phones.webmaster.rent', (phone) => {
            let phones = []; phones.push(phone);
            mc.api.call('phones.webmaster.rent', {action: 'rent', phones: phones}).then((res) => {
                if (res){
                    notify('Номер успешно арендован');
                    mc.router.go('/phones/')
                } else {
                    notify('Произошла ошибка')
                }
            });
        });
        mc.events.on('phones.webmaster.return', (phone) => {
            let phones = []; phones.push(phone);
            mc.api.call('phones.webmaster.rent', {action: 'return', phones: phones}).then((res) => {
                if (res){
                    notify('Номер успешно освобожден');
                    mc.router.go('/phones/')
                } else {
                    notify('Произошла ошибка')
                }
            });
        });

        return function (params) {
            document.title = "Номера | Yugo Platform";
            let title = 'Номера'
            let statuses = [
                {option: 'активный', value: 'active'},
                {option: 'арендованный', value: 'rented'},
                {option: 'архивный', value: 'archived'}
            ]

            return view({
                title: title,
                statuses: statuses,
                profile: mc.auth.get()
            });
        }
    });