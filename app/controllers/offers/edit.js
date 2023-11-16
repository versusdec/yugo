define(
  ["microcore", "mst!/offers/edit", "mst!/offers/phone", "app/modules/notify", "scripts"],
  function (mc, view, phone_view, notify, scripts
  ) {
      let item = {}, phones_statuses = [
          {option: mc.i18n('status.active'), value: 'active'},
          {option: mc.i18n('status.inactive'), value: 'inactive'},
          {option: mc.i18n('status.deactivated'), value: 'deactivated'}
      ];

      mc.events.on('offer.phone.add', async (button) => {
          $('#phones-list').append(await phone_view({statuses: phones_statuses}));
      });

      mc.events.on('sys:page.init:offers/edit', () => {
          $('button').on('click', (e) => {
              let type = e.target.dataset.type;

              if (type === 'next') {
                  let $next = $($('ul.tabs li.active')[0].nextElementSibling)
                  $next.removeClass('disabled')
                  return $next.find('a')[0].click()
              }

              item.name = $('input[name=name]').val();
              item.planned = $('input[name=planned]').val();
              if (!item.name.length) {
                  return scripts.fieldError('[name=name]', 0)
              }
              if (!!!item.category_id) {
                  return scripts.fieldError('input[name=category]', 0)
              }
              if (!!!item.user_id) {
                  return scripts.fieldError('input[name=merchant]', 0)
              }

              if (!item.tarification) {
                  item.tarification = {}
              }
              if (item.tarification.type === 'call') {
                  item.tarification.phone = $('input[name=phone]').val();
                  item.tarification.duration = parseInt($('input[name=duration]').val())
                  if (!item.tarification.phone.length) {
                      return scripts.fieldError('[name=phone]', 1)
                  }
                  if (!!!item.tarification.duration) {
                      return scripts.fieldError('[name=duration]', 1)
                  }
              } else {
                  item.tarification.phone ? delete item.tarification.phone : void 0;
                  item.tarification.duration ? delete item.tarification.duration : void 0;
              }
              item.tarification.merchant_price = parseFloat($('input[name=webmaster_price]').val());
              item.tarification.webmaster_price = parseFloat($('input[name=merchant_price]').val());
              item.tarification.autoapprove = parseInt($('input[name=autoapprove]').val()) || 0;
              item.tarification.calls = String($('input[name=calls]')[0].checked);

              item.phones = [];
              if (item.method === 'call') {
                  document.querySelectorAll('#phones-list .phone-item').forEach((el, i) => {
                      item.phones.push({
                          remote_id: el.querySelector('.phone-item-id').value,
                          label: el.querySelector('.phone-item-name').value,
                          phone: el.querySelector('.phone-item-phone').value,
                          status: el.querySelector('.phone-item-status > .option > span').dataset.value
                      });
                  });
              }

              mc.api.call('offers.' + type, item).then((res) => {
                  if (res && Number(res) > 0) {
                      switch (type) {
                          case 'create':
                              notify(
                                'Оффер создан',
                                'Оффер "' + item.name + '" успешно создан'
                              );
                              break;
                          case 'update':
                              if (res) {
                                  notify('Оффер обновлен', 'Оффер #' + item.id + ' успешно обновлен')
                              } else {
                                  notify('Оффер не изменился', 'Оффер #' + item.id + ' не был изменен')
                              }
                              break;
                      }
                      mc.router.go('/offers/')
                  } else {
                      notify('Произошла ошибка')
                  }
              })
          })
      });

      return async function (params) {
          let title = mc.i18n('offers.edit.create');
          let data = {id: params.id};
          if (params.id === 'new') {
              document.title = `${mc.i18n('offers.edit.create')} | Yugo Platform`;
              item = {
                  status: 'inactive',
                  method: 'lead',
                  tarification: {
                      type: 'lead',
                      webmaster_price: 25,
                      merchant_price: 75,
                      leg: 'merchant'
                  }
              }
          } else {
              document.title = `${mc.i18n('offers.edit.edit')} | Yugo Platform`;
              item = await mc.api.call('offers.get', {id: params.id});
              console.log(item);
              title = mc.i18n('offers.edit.edit');
              if (item.phones && item.phones.length) {
                  for (let phone of item.phones) {
                      phone.statuses = phones_statuses;
                  }
              }
          }
          data.title = title;
          data.statuses = [
              {option: mc.i18n('status.active'), value: 'active'},
              {option: mc.i18n('status.blocked'), value: 'blocked'},
              {option: mc.i18n('status.archived'), value: 'archived'},
          ];
          data.tarification = {
              types: [
                  {option:  mc.i18n('table.lead'), value: 'lead'},
                  {option:  mc.i18n('table.conversion'), value: 'conversion'}
              ]
          };
          data.methods = [
              {option: mc.i18n('table.lead'), value: 'lead'},
              {option: mc.i18n('table.call'), value: 'call'}
          ];
          data.legs = [
              {option: mc.i18n('offers.merchant'), value: 'merchant'},
              {option: mc.i18n('offers.client'), value: 'client'}
          ]

          data.item = item;

          data.status_change = (selected) => {
              item.status = selected.value
          };

          data.merchant_select = async (merchant) => {
              item.user_id = merchant.value
          };

          data.merchant_set = async (id) => {
              let item = await mc.api.call('users.get', {
                  id: id
              });
              if (item)
                  return {
                      option: item.name + ' ' + item.surname + ' (' + item.email + ') - ' + item.status,
                      value: item.id
                  }
          };

          data.merchant_suggest = async (value) => {
              let data = await mc.api.call('agencies.users.list', {
                  q: value,
                  role: 'merchant'
              });
              console.log(data);
              let items = [];

              if(data && data.items && data.items.length){
                  for (let i in data.items) {
                      let item = data.items[i];
                      items.push({
                          option: item.name + ' ' + item.surname + ' (' + item.email + ') - ' + item.status,
                          value: item.id
                      })
                  }
              }

              return items
          };

          data.category_select = async (category) => {
              item.category_id = parseInt(category.value)
          };

          data.category_set = async (id) => {
              let item = await mc.api.call('categories.get', {
                  id: id
              });
              return {
                  option: item.name,
                  value: item.id
              }
          };

          /*data.category_suggest = async (value) => {
              let data = await mc.api.call('categories.suggest', {
                  q: value
              });

              let items = [];

              if(data && data.items && data.items.length){
                  for (let i in data.items) {
                      let item = data.items[i];
                      items.push({
                          option: item.name,
                          value: item.id
                      })
                  }
              }

              return items
          };*/

          data.region_select = async (data) => {
              console.log(data);
              item.region_id = +data.value
          };

          data.tarification_type_change = (type) => {
              if (type.value === 'call') {
                  if (!item.tarification) {
                      item.tarification = {}
                  }
                  item.tarification.type = type.value;
                  $('#duration').removeClass('hide');
              } else {
                  $('#duration').addClass('hide');
                  item.tarification.type = type.value;
              }
          };

          data.method_change = (selected) => {
              item.method = selected.value
              if (item.method === 'lead') {
                  $('li.tab-phones').addClass('disabled');
              } else {
                  $('li.tab-phones').removeClass('disabled');
              }
          };

          data.leg_change = (selected) => {
              item.tarification.leg = selected.value;
          }

          return view(data);
      }
  });