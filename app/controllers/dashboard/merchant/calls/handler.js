define(['microcore', 'mst!dashboard/merchant/leads/item'], function (mc, item_view) {

  let filter = {};

  mc.events.on('dashboard:merchant.calls.filter.range.start', async (selected) => {
    filter.start = selected.value
  });

  mc.events.on('dashboard:merchant.calls.filter.range.finish', async (selected) => {
    filter.finish = selected.value
  });
  mc.events.on('dashboard:merchant.calls.filter', async ($scope) => {
    let hash_params = mc.router.hash();
    let page = parseInt(hash_params.page) || 1;
    let limit = parseInt(hash_params.limit) || 10;
    let user = await mc.api.call('users.me');

    mc.api.call("stats.sales.leads", {
      type: 'calls',
      start: filter.start,
      finish: filter.finish,
      limit: limit,
      offset: (page - 1) * limit
    }).then(async function (calls) {
      if (calls && calls.items && calls.items.length) {
        $($scope).find('.loader').remove();
        $($scope).find('table tbody').html('');
        for (let i in calls.items) {
          let item = calls.items[i];
          item.filter = filter;
          $($scope).find('table tbody').append(await item_view(item))
        }
      } else {
        $($scope).find('.loader').text("нет конверсий")
      }

      mc.events.push('system:pagination.update', {
        total: calls.total,
        limit: calls.limit,
        current: page
      })
    })
  });

  return async function ($scope, $params) {
    await mc.events.push('dashboard:merchant.calls.filter', $scope)
  }
});