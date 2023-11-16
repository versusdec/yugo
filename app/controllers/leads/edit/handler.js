define(['microcore', 'mst!leads/edit/item', "/app/modules/confirm", "/app/modules/notify"],
  function (mc, item_view, confirm, notify) {
    let filter = {};
    let page = 1;

    mc.events.on('leads:history.filter', async ($scope) => {
      let profile = mc.auth.get();
      filter.offset = (page - 1) * filter.limit;
      let lead = await mc.api.call("sales.history", filter);

      $($scope).find('table > tbody').html('');
      if (lead && lead.items.length) {
        for (let i in lead.items) {
          let item = lead.items[i];
          item.profile = profile;
          $($scope).find('table > tbody').append(await item_view(item))
        }
      } else {
        $($scope).find('.loader').html("нет действий")
      }

      mc.events.push('system:pagination.update', {
        total: lead.total,
        limit: lead.limit,
        current: page
      })
    });

    return async ($scope, $params) => {
      let hash_params = mc.router.hash();
      page = parseInt(hash_params.page) || 1;
      filter.limit = parseInt(hash_params.limit) || 10;
      filter.offset = (page - 1) * filter.limit;
      filter.lead_id = $params.lead;

      await mc.events.push('leads:history.filter', $scope)
    }
  });