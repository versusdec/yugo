define(["microcore", "mst!/billing/index"], function (mc, view) {

    mc.events.on('sys:page.init:billing/index', function () {

    });

    return async function (params) {
        document.title = `${mc.i18n('billing.title')} | Yugo Platform`;
        let filter = mc.router.hash();
        filter.currency ? void 0 : filter.currency = 'select';
        filter.operation ? void 0 : filter.operation = 'select';
        filter.event ? void 0 : filter.event = 'select';
        let user = await mc.api.call('users.me');
        let data = {
            page: params.page || 'transactions', balance: user.balance, role: user.role, statuses: [{
                option: mc.i18n('status.all'), value: 'all'
            }, {
                option: mc.i18n('status.new'), value: 'new'
            }, {
                option: mc.i18n('status.pending'), value: 'pending'
            }, {
                option: mc.i18n('status.success'), value: 'succeeded'
            }, {
                option: mc.i18n('status.declined'), value: 'canceled'
            }],
            filter: filter,
            user_set: async (id) => {
                let item = await mc.api.call('users.get', {id: id});
                return {
                    option: item.name + ' ' + item.surname + ' (' + item.email + ') - ' + item.status, value: item.id
                }
            },
            network_set: async (id) => {
                let item = await mc.api.call('networks.get', {id: id});
                return {
                    option: item.name, value: item.id
                }
            },
            agency_set: async (id) => {
                let item = await mc.api.call('agencies.get', {id: id});
                return {
                    option: item.name, value: item.id
                }
            },
        }
        switch (user.role) {
            case 'admin':
                data.user_suggest = 'users.suggest';
                break;
            case 'network_manager':
            case 'agency_manager':
            case 'agency_admin':
                data.user_suggest = 'agencies.users.list'
                break;
        }

        return view(data);
    }
});