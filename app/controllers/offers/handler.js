define(
  ['microcore', 'mst!offers/item', "/app/modules/confirm", "/app/modules/notify", "app/modules/suggests"],
  function (mc, item_view, confirm, notify
  ) {
      let page = 1,
        filter = {
            limit: 10
        }, hash,
        profile = mc.auth.get();

      mc.events.on('offers.remove', (offer) => {
          confirm('Удалить оффер?', offer.name, () => {
              mc.api.call('offers.remove', {id: parseInt(offer.id)}).then(res => {
                  if (res) {
                      notify('Оффер удален', 'Оффер "' + offer.name + '" успешно удален');
                      mc.router.go('/offers/')
                  } else
                      notify('Произошла ошибка', 'Оффер используется')
              })
          })
      });

      async function suggest(method, params, cb) {
          let data = await mc.api.call(method, params);

          let items = [];

          for (let i in data.items) {
              let item = data.items[i];
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

      mc.events.on('offers.filter.name.change', async (input) => {
          filter.name = input.value;
      });
      mc.events.on('offers.filter.merchants.change', async (selected) => {
          filter.user_id = parseInt(selected.value) || undefined;
      });
      mc.events.on('offers.filter.category.change', async (selected) => {
          filter.category = parseInt(selected.value) || undefined;
      });
      mc.events.on('offers.filter.type.change', async (selected) => {
          filter.type = selected.value;
      });
      mc.events.on('offers.filter.status.change', async (selected) => {
          filter.status = selected.value;
      });

      /*
      mc.events.on('offers.filter.merchants.suggest', async (value) => {
          return await suggest('users.suggest', {q: value, role: 'merchant'}, function (item) {
              return {
                  option: item.name + ' ' + item.surname + ' (' + item.email + ') - ' + item.status,
                  value: item.id
              }
          })
      });*/

      mc.events.on('offers.filter.apply', async ($scope) => {
          filter.offset = (page - 1) * filter.limit;
          let offers = await mc.api.call("offers.list", filter);
          console.log(offers);
          if (offers && offers.items && offers.items.length) {
              $($scope).find('.list').html('');
              for (let i in offers.items) {
                  let item = offers.items[i];
                  item.user = mc.auth.get();
                  // let merch = await mc.api.call('')
                  $($scope).find('.list').append(await item_view(item))
              }
          } else {
              $($scope).html(`<div class="block"><div class="loader">${mc.i18n('table.empty')}</div></div>`)
          }

          mc.events.push('system:pagination.update', {
              id: 'offers',
              total: offers.total || 0,
              limit: offers.limit,
              current: page
          })

      });

      mc.events.on('offers.filter.reset', async ($scope) => {
          mc.router.go(location.pathname);
      });

      mc.events.on("offers.filter.filter", async ($scope) => {
          filter.page = 1;
          for (let k in filter) {
              if (filter[k] === undefined) {
                  delete filter[k];
              }
          }
          mc.router.go(mc.router.hash(filter));
      });

      return async ($scope, $params) => {
          let hash_params = mc.router.hash();
          filter = hash_params;
          page = parseInt(hash_params.page) || 1;
          filter.limit = parseInt(hash_params.limit) || 10;
          filter.offset = (page - 1) * filter.limit;

          await mc.events.push('offers.filter.apply', $scope)
      }
  });