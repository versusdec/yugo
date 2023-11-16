define(['microcore', 'mst!leads/list/item', "/app/modules/confirm", "/app/modules/notify", "scripts", "app/modules/suggests"],
  function (mc, item_view, confirm, notify, scripts) {
      let filter = {}, hash;
      let page = 1;
      let profile = mc.auth.get();

      mc.events.on('merchants.filter.apply', async ($scope) => {
          filter.role = 'merchant';
          let users = await mc.api.call("agencies.users.list", filter);
          console.log(users);
          $($scope).find('table > tbody').html('');
          if (users && users.items && users.items.length) {
              for (let i in users.items) {
                  let item = users.items[i];
                  item.profile = profile;
                  $($scope).find('table > tbody').append(await item_view(item))
              }
          } else {
              $($scope).find('table > tbody').html(`<td colspan='7'><div class=\"loader\">${mc.i18n('table.empty')}</div></td>`)
          }

          mc.events.push('system:pagination.update', {
              total: filter.total || 0,
              limit: filter.limit || 10,
              current: page,
          })
      });

      return async ($scope, $params) => {
          hash = mc.router.hash();
          page = +hash.page || 1;
          filter.limit = +hash.limit || 10;
          filter.offset = (page - 1) * filter.limit;
          if (hash.registered) {
              // filter.registered = scripts.setTimestamp(hash.period);
          }

          await mc.events.push('merchants.filter.apply', $scope)
      }
  });