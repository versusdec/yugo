define([
  'microcore',
  'mst!billing/topup/item',
  'app/modules/popup',
  'app/modules/notify',
  'app/modules/confirm',
  "app/modules/suggests"
], function (mc, item_view, popup, notify, confirm) {
  let filter = {direction: 'in'}, page;

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

  function field_error(field, tab) {
    // $('ul.tabs li a')[tab].click();
    $(field).addClass('error');
    setTimeout(() => {
      $(field).removeClass('error')
    }, 3000);
    return false
  }

  mc.events.on('topup.show', () => {
    $('#topup').removeClass('hide');
  });

  mc.events.on('merchants.suggest', async (value) => {
    return await suggest('users.suggest', {q: value, role: 'merchant'}, function (item) {
      return {
        option: item.name + ' ' + item.surname + ' (' + item.email + ') - ' + item.status,
        value: item.id
      }
    })
  });

  mc.events.on('topup.accept', (role) => {
    let profile = mc.auth.get();
    if (profile.role === "admin"){
      let data = {direction: 'in', type: 'invoice'};
      data.user_id = $('#topup input[name=merchant_id]')[0].dataset.value;
      if (!(data.user_id && data.user_id.length)){
        return field_error('#topup input[name=merchant_id]')
      }
      data.amount = $('#topup input[name=amount]').val();
      if (!(data.amount && data.amount.length)){
        return field_error('#topup input[name=amount]')
      }
      data.comment = $('#topup textarea[name=comment]').val();
      mc.api.call("payments.add", data).then((res) => {
        if (res){
          notify('Платеж '+ res +' успешно создан');
          mc.router.go(location.pathname);
        } else {
          notify('Произошла ошибка')
        }
      });
    } else {
      let data = {direction: 'in', type: 'yandex'};
      data.amount = $('#topup input[name=amount]').val();
      if (!(data.amount && data.amount.length)){
        return field_error('#topup input[name=amount]')
      }
      mc.api.call("payments.create", data).then((res) => {
        if (res){
          if (res.payment_url){
            window.open(res.payment_url, 'blank');
            mc.router.go(location.pathname);
          } else {
            notify('Произошла ошибка')
          }
        } else {
          notify('Произошла ошибка')
        }
      });
    }
  });

  mc.events.on('payments.pay', (id) => {
    mc.api.call('payments.pay', {id: parseInt(id)}).then(res => {
      if (res)
        window.open(res.payment_url);
      else
        notify('Произошла ошибка')
    })
  });

  mc.events.on('payments.cancel', (id) => {
    confirm('Отменить платеж?', '', () => {
      mc.api.call('payments.cancel', {id: parseInt(id)}).then(res => {
        if (res) {
          notify('Платеж отменен');
        } else
          notify('Произошла ошибка')
      })
    })
  });

  mc.events.on('topup.filter.range.start', async (selected) => {
    filter.start = selected.value
  });

  mc.events.on('topup.filter.range.finish', async (selected) => {
    filter.finish = selected.value
  });

  mc.events.on('topup.filter.status.change', async (selected) => {
    filter.status = selected.value
  });

  mc.events.on('topup.filter.user.change', async (selected) => {
    filter.user_id = parseInt(selected.value) || undefined
  });

  mc.events.on('topup.reset', async (button) => {
    /*
    let profile = mc.auth.get(), block = button.parentElement.parentElement;
    $(block).find('input[name=start]').val('');
    $(block).find('input[name=finish]').val('');
    if (profile.role && profile.role === "admin") {
      $(block).find('input[name=user_id]').val('');
      $(block).find('input[name=user_id]')[0].dataset.value = '';
    }
    filter = {limit: 10, direction: 'in', status: 'all'};
    page = 1;
    //await mc.events.push('topup.filter.apply', $scope);
    mc.router.go('/billing/topup');
     */
    mc.router.go('/billing/topup');
  });

  mc.events.on("topup.filter.filter", async ($scope) => {
    filter.page = 1;
    filter.direction = 'in';
    for (let k in filter){
      if (filter[k] === undefined){
        delete filter[k];
      }
    }
    mc.router.go(mc.router.hash(filter));
  });

  mc.events.on('topup.filter.apply', async ($scope) => {
    let profile = mc.auth.get();
    filter.offset = (page - 1) * filter.limit;
    let payments = await mc.api.call("payments.list", filter);
    if (payments && payments.items) {
      $($scope).find('table > tbody').html('');
      if (payments.items.length) {
        for (let i in payments.items) {
          let item = payments.items[i];
          item.profile = profile;
          $($scope).find('table > tbody').append(await item_view(item))
        }
      }
      $($scope.parentElement).find('span[data-total]').text(payments.total);
    } else {
      $($scope).find('.loader').html("нет выплат")
    }

    mc.events.push('system:pagination.update', {
      id: 'payments',
      total: payments.total,
      limit: payments.limit,
      current: page
    })
  });

  return async function ($scope, $params) {
    let hash_params = mc.router.hash();
    filter = hash_params;
    page = parseInt(hash_params.page) || 1;
    filter.limit = parseInt(hash_params.limit) || 10;
    filter.offset = (page - 1) * filter.limit;
    filter.direction = 'in';

    await mc.events.push('topup.filter.apply', $scope);
  }
});