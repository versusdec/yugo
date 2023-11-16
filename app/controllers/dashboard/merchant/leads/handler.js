define(['microcore', 'mst!dashboard/merchant/leads/item'], function (mc, item_view) {

  let filter = {};

  mc.events.on('dashboard:merchant.leads.filter.range.start', async (selected) => {
    filter.start = selected.value
  });

  mc.events.on('dashboard:merchant.leads.filter.range.finish', async (selected) => {
    filter.finish = selected.value
  });

  mc.events.on('dashboard:merchant.leads.filter', async ($scope) => {
    let hash_params = mc.router.hash();
    let page = parseInt(hash_params.page) || 1;
    let limit = parseInt(hash_params.limit) || 10;
    let user = await mc.api.call('users.me');

    mc.api.call("stats.sales.leads", {
      type: 'leads',
      start: filter.start,
      finish: filter.finish,
      limit: limit,
      offset: (page - 1) * limit
    }).then(async function (leads) {
      if (leads && leads.items && leads.items.length) {
        $($scope).find('.loader').remove();
        $($scope).find('table tbody').html('');
        for (let i in leads.items) {
          let item = leads.items[i];
          item.filter = filter;
          $($scope).find('table tbody').append(await item_view(item))
        }
      } else {
        $($scope).find('.loader').text("нет лидов")
      }

      mc.events.push('system:pagination.update', {
        total: leads.total,
        limit: leads.limit,
        current: page
      })
    })
  });

  return async function ($scope, $params) {
    await mc.events.push('dashboard:merchant.leads.filter', $scope)
  }
});