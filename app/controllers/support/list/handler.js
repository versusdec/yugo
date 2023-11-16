define(['microcore', 'mst!support/list/item', "/app/modules/confirm", "/app/modules/notify", "app/modules/suggests"],
  function (mc, item_view, confirm, notify) {
    let filter = {}, page, tab = 'tech';

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

      mc.events.on('support.users.suggest', async (value) => {
          return await suggest('users.suggest', {q: value}, function (item) {
              return {
                  option: item.name + ' ' + item.surname + ' (' + item.email + ') - ' + item.status,
                  value: item.id
              }
          })
      })

    mc.events.on('ticket.archive', (id) => {
        confirm('Архивировать?', 'Обращение #'+id, () => {
            mc.api.call("support.archive", {id: id}).then(() => {
                mc.router.go('/support/');
            });
        });
    });

    mc.events.on('ticket.unarchive', (id) => {
        confirm('Разархивировать?', 'Обращение #'+id, () => {
            mc.api.call("support.unarchive", {id: id}).then(() => {
                mc.router.go('/support/');
            });
        });
    });

    mc.events.on('ticket.close', (id) => {
        confirm('Закрыть?', 'Обращение #'+id, () => {
            mc.api.call("support.close", {id: id}).then(() => {
                mc.router.go('/support/');
            });
        });
    });

    mc.events.on('ticket.reopen', (id) => {
        confirm('Открыть?', 'Обращение #'+id, () => {
            mc.api.call("support.reopen", {id: id}).then(() => {
                mc.router.go('/support/');
            });
        });
    });

      mc.events.on('support.filter.range.start', async (selected) => {
          filter.start = selected.value
      });

      mc.events.on('support.filter.range.finish', async (selected) => {
          filter.finish = selected.value
      });

      mc.events.on('support.filter.status.change', async (selected) => {
          filter.status = selected.value
      });

      mc.events.on('support.filter.user.change', async (selected) => {
          filter.user_id = parseInt(selected.value) || undefined
      });

      mc.events.on('support.filter.reset', async (button) => {
          mc.router.go('/support/'+tab);
      });

      mc.events.on("support.filter.filter", async ($scope) => {
          filter.page = 1;
          for (let k in filter){
              if (filter[k] === undefined){
                  delete filter[k];
              }
          }
          mc.router.go(mc.router.hash(filter));
      });

      mc.events.on('support.filter.apply', async ($scope) => {
          let tickets = await mc.api.call("support.list", filter), profile = mc.auth.get();

          if (tickets && tickets.items && tickets.items.length) {
              $($scope).find('tbody').html('');
              for (let i in tickets.items) {
                  let item = tickets.items[i];
                  item.profile = profile;
                  $($scope).find('tbody').append(await item_view(item))
              }
          } else {
              $($scope).find('.loader').html("нет обращений")
          }

          mc.events.push('support:stats.update', {
              total: tickets.total,
          });

          mc.events.push('system:pagination.update', {
              id: 'support',
              total: tickets.total,
              limit: tickets.limit,
              current: page
          })
      });


    return async ($scope, $params) => {
      let hash_params = mc.router.hash();
      filter = hash_params;
      page = parseInt(hash_params.page) || 1;
      filter.limit = parseInt(hash_params.limit) || 10;
      filter.offset = (page - 1) * filter.limit;
      tab = $params.tab.length ? $params.tab : 'tech';
      switch (tab) {
        case 'tech':
            filter.theme = tab;
            //delete filter.status;
            break;
        case 'finance':
          filter.theme = tab;
          //delete filter.status;
          break;
        case 'archived':
          filter.status = tab;
          delete filter.theme;
          break;
      }

      await mc.events.push('support.filter.apply', $scope);
    }
  });