define(
  ["microcore", "mst!/sales/list/index", "app/modules/notify", "app/modules/confirm", "app/modules/suggests"],
  function (mc, view, notify, confirm) {
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

      let filter = {}
      mc.events.on('sales.available.update', async () => {
          try {
              if ($('#leads_sell').length) {
                  if (!filter.merchant_id) {
                      $('span[data-available]').text('Необходимо выбрать рекламодателя')
                      $('#leads_sell')[0].disabled = true
                  } else if (!filter.category) {
                      $('span[data-available]').text('Необходимо выбрать категорию')
                      $('#leads_sell')[0].disabled = true
                  } else if (!filter.offer_id) {
                      $('span[data-available]').text('Необходимо выбрать оффер')
                      $('#leads_sell')[0].disabled = true
                  } else {
                      $('span[data-available]').text(await mc.api.call('leads.available', filter))
                      if (!filter.quantity) {
                          $('#leads_sell')[0].disabled = true
                      } else {
                          $('#leads_sell')[0].disabled = false
                      }
                  }
              }
          } catch (e) {
              console.log(e.message);
          }
      })

      mc.events.on('sales.filter.region.change', async (selected) => {
          filter.region = selected.value && parseInt(selected.value) || null
          mc.events.push('sales.available.update')
      })

      mc.events.on('sales.filter.category.change', async (selected) => {
          filter.category = selected.value && parseInt(selected.value) || null
          mc.events.push('sales.available.update')
      })

      mc.events.on('sales.filter.source.change', async (selected) => {
          filter.source = selected.value && parseInt(selected.value) || null
          mc.events.push('sales.available.update')
      })

      mc.events.on('sales.filter.webmaster.change', async (selected) => {
          filter.webmaster_id = selected.value && parseInt(selected.value) || null
          mc.events.push('sales.available.update')
      })

      mc.events.on('sales.filter.merchant.change', async (selected) => {
          filter.merchant_id = selected.value && parseInt(selected.value) || null
          mc.events.push('sales.available.update')
      })

      mc.events.on('sell.offers.suggest', async (value) => {
          return await suggest('offers.suggest', {q: value, user_id: parseInt($('.block.sell input[name="merchant"]')[0].dataset.value)})
      })
      mc.events.on('sell.filter.offer.change', async (selected) => {
          filter.offer_id = selected.value && parseInt(selected.value) || null
          mc.events.push('sales.available.update')
      })

      mc.events.on('sales.quantity.change', async (value) => {
          filter.quantity = value && parseInt(value) || null
          mc.events.push('sales.available.update')
      })

      mc.events.on('offers.suggest', async (value) => {
          filter.quantity = value && parseInt(value) || null
          mc.events.push('sales.available.update')
      })

      mc.events.on('sell.filter.tag.change', (selected) => {
          filter.tag = parseInt(selected.value) || undefined;
          mc.events.push('sales.available.update')
      });

      mc.events.on('sell.filter.range.start', (selected) => {
          filter.start = selected.value;
          mc.events.push('sales.available.update')
      });

      mc.events.on('sell.filter.range.finish', (selected) => {
          filter.finish = selected.value;
          mc.events.push('sales.available.update')
      });

      mc.events.on('leads.sell', (value) => {
          confirm('Вы уверены?', 'Вы хотите отправить ' + filter.quantity + ' лидов', async () => {
              let sold = await mc.api.call("leads.sell", filter);
              if (sold) {
                  if (sold.code || sold.message || isNaN(sold)) {
                      notify('Произошла ошибка')
                  } else {
                      notify('Лиды отправлены', "\nОтправлено: " + sold + " лидов")
                      setTimeout(() => {
                          mc.events.push('sales.available.update')
                      }, 1000)
                  }
              } else {
                  notify('Произошла ошибка')
              }
          })
      })

      return function (params) {
          document.title = `${mc.i18n('sales.title')} | Yugo Platform`;
          let title = mc.i18n('sales.title');
          filter = {};

          let data = {
              title: title,
              user: mc.auth.get(),
              actions_options: [
                  {option: mc.i18n('status.inwork'), value: 'inwork'},
                  {option: 'Hold', value: 'hold'},
                  {option: mc.i18n('status.approved'), value: 'approved'},
                  {option: mc.i18n('status.rejected'), value: 'rejected'},
              ],
              statuses_options: [
                  {option: mc.i18n('status.new'), value: 'new'},
                  {option: mc.i18n('status.inwork'), value: 'inwork'},
                  {option: 'Hold', value: 'hold'},
                  {option: mc.i18n('status.approved'), value: 'approved'},
                  {option: mc.i18n('status.rejected'), value: 'rejected'},
                  {option: mc.i18n('status.appealed'), value: 'appealed'}
              ],
              sales_filter: mc.router.hash(),
              offer_set: async (id) => {
                  let item = await mc.api.call('offers.get', {id: id});
                  console.log(item);
                  return {
                      option: item.name,
                      value: item.id
                  }
              }
          };

          data.sales_filter.phones = mc.storage.get('sales_filter_phones');

          if (data.user.role === "admin") {
              data.actions_options.push({option: 'Апелляция', value: 'appealed'});
              data.user_set = async (id) => {
                  let item = await mc.api.call('users.get', {id: id});
                  return {
                      option: item.name + ' ' + item.surname + ' (' + item.email + ') - ' + item.status,
                      value: item.id
                  }
              }
              data.tag_set = async (id) => {
                  let item = await mc.api.call('tags.get', {id: id});
                  return {
                      option: item.name,
                      value: item.id
                  }
              }
              data.category_set = async (id) => {
                  let item = await mc.api.call('categories.get', {id: id});
                  return {
                      option: item.name,
                      value: item.id
                  }
              }
          }

          return view(data);
      }
  });