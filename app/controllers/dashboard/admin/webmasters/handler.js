define(['microcore', 'mst!dashboard/admin/webmasters/item', "/app/modules/confirm", "/app/modules/notify"],
  function (mc, item_view, confirm, notify) {
    let filter = {
      limit: 10
    };

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

    mc.events.on('dashboard:admin.webmasters.filter.start', async (selected) => {
      filter.start = selected.value;
    });

    mc.events.on('dashboard:admin.webmasters.filter.finish', async (selected) => {
      filter.finish = selected.value
    });

    mc.events.on('dashboard:admin.webmasters.filter.change', async (selected) => {
      filter.user_id = selected.value
    });

    mc.events.on('dashboard:admin.webmasters.suggest', async (value) => {
      return await suggest('users.suggest', {q: value, role: 'webmaster'}, function (item) {
        return {
          option: item.name + ' ' + item.surname + ' (' + item.email + ') - ' + item.status,
          value: item.id
        }
      })
    });

    mc.events.on('dashboard:admin.webmasters.filter', async ($scope) => {
      $($scope).find('tbody').html('');
      let webmasters = await mc.api.call("stats.webmasters", filter);
      if (webmasters && webmasters.items && webmasters.items.length) {
        for (let i in webmasters.items) {
          let item = webmasters.items[i];
            item.filter = filter;
          $($scope).find('table > tbody').append(await item_view(item))
        }
      } else {
        $($scope).find('.loader').html("нет вебмастеров")
      }

      $($scope).find('#webmasters-stats span[data-total]').text(webmasters.total);
    });

    return async ($scope, $params) => {

      await mc.events.push('dashboard:admin.webmasters.filter', $scope)
    }
  });