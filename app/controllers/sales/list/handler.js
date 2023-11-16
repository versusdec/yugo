define(['microcore', 'mst!sales/list/item', "/app/modules/confirm", "/app/modules/notify",
      "/app/modules/popup", "mst!/sales/list/reject", "app/modules/suggests"],
  function (mc, item_view, confirm, notify, popup, reject_popup) {

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
      let page = 1
      let mass = {status: '', items: [], status_ru: '', notes: '', attachments: []}

      function field_error(field) {
          $(field).addClass('error')
          setTimeout(() => {
              $(field).removeClass('error')
          }, 3000)
          return false
      }

      mc.events.on('sales.set.status', (data) => {
          if (data.status && data.item) {
              $('input[name=check]').forEach(e => {
                  e.checked = false
              });
              mass = {status: data.status, items: [], status_ru: '', notes: '', attachments: []};
              if (data.status === "approved") {
                  mass.status_ru = "Принят";
              } else if (data.status === "inwork") {
                  mass.status_ru = "В работе";
              } else if (data.status === "rejected") {
                  mass.status_ru = "Отклонен"
              } else if (data.status === "appealed") {
                  mass.status_ru = "Апелляция"
              } else if (data.status === "hold") {
                  mass.status_ru = "Hold";
              }
              mass.items.push(data.item);
              if (mass.status === "approved" || mass.status === "inwork" || mass.status === "appealed" || mass.status === "hold") {
                  confirm('Подтвердите действие', `Применить статус &laquo;${mass.status_ru}&raquo; для #${mass.items[0].lead_id}?`, () => {
                      mc.api.call("sales.status", {status: mass.status, items: mass.items}).then((res) => {
                          if (res) {
                              notify('Данные обновлены', `обработано: ${res.total}, изменено: ${res.processed}`);
                              //mc.router.go('/sales/');
                              location.href = location.href.replace(/page=\d+/gi, "page=1");
                          } else {
                              notify('Произошла ошибка')
                          }
                      });
                  })
              } else if (mass.status === "rejected") {
                  popup(reject_popup);
              }
          }
      });

      mc.events.on('sales.action.change', (select) => {
          mass.status = select.value;
          mass.status_ru = select.option;
      });

      mc.events.on('sales.filter.period.change', (selected) => {
          filter.period = selected.value;
      });

      mc.events.on('sales.filter.merchant.changed', async (selected) => {
          filter.user_id = parseInt(selected.value) || undefined;
      })

      mc.events.on('sales.filter.offers.suggest', async (value) => {
          return await suggest('offers.suggest', {
              q: value,
              user_id: parseInt($('.block.filters input[name="merchant"]')[0].dataset.value)
          })
      })
      mc.events.on('sales.filter.offer.changed', async (selected) => {
          filter.offer_id = parseInt(selected.value) || undefined;
      });

      mc.events.on('sales.filter.status.change', (selected) => {
          filter.status = selected.value;
      });

      mc.events.on('sales.filter.phones', (value) => {
          filter.phones = value;
          mc.storage.set('sales_filter_phones', filter.phones);
      });

      mc.events.on('sales.filter.tag.change', (selected) => {
          filter.tag = parseInt(selected.value) || undefined;
      });

      mc.events.on('sales.filter.category.changed', async (selected) => {
          filter.category = selected.value && parseInt(selected.value) || null
      })
      mc.events.on('sales.filter.webmaster.changed', async (selected) => {
          filter.webmaster_id = selected.value && parseInt(selected.value) || null
      })

      mc.events.on('sales.check.all', (input) => {
          if (input.checked) {
              $('input[name=check]').forEach(e => {
                  e.checked = true
              })
          } else {
              $('input[name=check]').forEach(e => {
                  e.checked = false
              })
          }
      });

      mc.events.on('sales.apply', () => {
          mass.items = [];
          $('input[name=check]').forEach(e => {
              e.checked ? mass.items.push({
                  lead_id: parseInt(e.dataset.lead),
                  offer_id: parseInt(e.dataset.offer),
                  user_id: parseInt(e.dataset.user)
              }) : void 0;
          });
          if (mass.items.length) {
              if (mass.status === "approved" || mass.status === "inwork" || mass.status === "appealed" || mass.status === "hold") {
                  confirm('Подтвердите действие', `Применить статус &laquo;${mass.status_ru}&raquo; для отмеченных?`, () => {
                      mc.api.call("sales.status", {status: mass.status, items: mass.items}).then((res) => {
                          if (res) {
                              notify('Данные обновлены', `обработано: ${res.total}, изменено: ${res.processed}`);
                              //mc.router.go('/sales/');
                              location.href = location.href.replace(/page=\d+/gi, "page=1");
                          } else {
                              notify('Произошла ошибка')
                          }
                      });
                  })
              } else if (mass.status === "rejected") {
                  popup(reject_popup);
              }
          } else {
              notify('Ничего не выбрано')
          }
      });

      mc.events.on("sales.mass.notes.set", (value) => {
          mass.notes = value;
      });
      mc.events.on("sales.mass.reject", () => {
          if (mass.notes && mass.notes.length > 2) {
              mc.api.call("sales.status", {
                  status: mass.status,
                  items: mass.items,
                  notes: mass.notes,
                  attachments: mass.attachments
              }).then(async (res) => {
                  if (res) {
                      $('.popup').remove();
                      notify('Данные обновлены', `обработано: ${res.total}, изменено: ${res.processed}`);
                      //mc.router.go('/sales/');
                      location.href = location.href.replace(/page=\d+/gi, "page=1");
                  } else {
                      notify('Произошла ошибка')
                  }
              });
          } else {
              return field_error('textarea#notes');
          }
      });
      mc.events.on("sales.mass.upload.file", (files) => {
          for (let file of files) {
              mass.attachments.push(file.path);
              $('ul#attachments-list').append(`
            <li>${file.path} 
            <span class="mdi mdi-delete remove"
            style="cursor: pointer"  
            onclick="___mc.events.push('sales.mass.attachment.remove', '${file.path}');this.closest('li').remove();">
            </span>
            </li>
        `);
          }
      });
      mc.events.on("sales.mass.attachment.remove", (file) => {
          let new_attachments = [];
          for (let attach of mass.attachments) {
              if (attach !== file) {
                  new_attachments.push(attach);
              }
          }
          mass.attachments = new_attachments;
      });

      mc.events.on('sales.filter.apply', async ($scope) => {
          filter.offset = (page - 1) * filter.limit
          let sales = await mc.api.call("sales.list", filter)
          console.log(sales);
          let user = mc.auth.get()

          if (sales.items.length) {
              $($scope).find('table > tbody').html('')
              for (let i in sales.items) {
                  let item = sales.items[i]
                  $($scope).find('table > tbody').append(await item_view({item: item, user: user}))
              }
          } else {
              $($scope).find('.loader').html(mc.i18n('table.empty'))
          }

          mc.events.push('system:pagination.update', {
              id: 'sales',
              total: sales.total,
              limit: sales.limit,
              current: page
          });

          $('#sales-stats span[data-total]').text(sales.total);
      });

      mc.events.on('sales.filter.reset', async ($scope) => {
          mc.storage.unset('sales_filter_phones');
          mc.router.go(location.pathname);
      });

      mc.events.on("sales.filter.filter", async ($scope) => {
          filter.page = 1;
          for (let k in filter) {
              if (filter[k] === undefined) {
                  delete filter[k];
              }
          }
          delete filter.phones;
          mc.router.go(mc.router.hash(filter));
      });

      mc.events.on('sales.export', async () => {
          let form = document.createElement("FORM");
          form.action = "/export/";
          form.method = "POST";
          form.style.visibility = "hidden";
          form.style.height = "1px";
          form.style.width = "1px";
          for (const key in filter) {
              if (filter[key] !== undefined && filter[key] !== null) {
                  let input = document.createElement("INPUT");
                  input.name = key;
                  input.value = filter[key];
                  form.appendChild(input);
              }
          }
          let input = document.createElement("INPUT");
          input.name = "method";
          input.value = "sales.export";
          form.appendChild(input);
          document.body.appendChild(form);
          form.submit();
          document.body.removeChild(form);
      });

      return async ($scope, $params) => {
          let hash_params = mc.router.hash()
          filter = hash_params;
          filter.phones = mc.storage.get('sales_filter_phones');
          page = parseInt(hash_params.page) || 1
          filter.limit = parseInt(hash_params.limit) || 10
          filter.offset = (page - 1) * filter.limit

          await mc.events.push('sales.filter.apply', $scope)
      }
  });