define(
  ["microcore", "mst!/sales/edit/index", "mst!/leads/edit/field", "mst!sales/edit/reject", "/app/modules/confirm", "/app/modules/notify", "/app/modules/popup"],
  function (mc, view, field_view, reject_popup, confirm, notify, popup
  ) {
      let data = {};

      function field_error(field) {
          $(field).addClass('error')
          setTimeout(() => {
              $(field).removeClass('error')
          }, 3000)
          return false
      }

      mc.events.on("sales.change.status", async (detail) => {
          if (detail.status === "approved") {
              confirm('Подтвердите действие', `Применить статус?`, () => {
                  mc.api.call("sales.approve", {
                      lead_id: data.item.id,
                      offer_id: data.item.offer_id,
                      user_id: data.item.user_id
                  }).then(async (res) => {
                      if (res) {
                          notify('Данные обновлены');
                          mc.router.go('/sales/');
                      } else {
                          notify('Произошла ошибка')
                      }
                  });
              });
          } else {
              popup(reject_popup);
          }
      });
      mc.events.on("sales.notes.set", (value) => {
          data.item.notes = value;
      });
      mc.events.on("sales.reject", () => {
          if (data.item.notes && data.item.notes.length > 2) {
              mc.api.call("sales.reject", {
                  lead_id: data.item.id,
                  offer_id: data.item.offer_id,
                  user_id: data.item.user_id,
                  notes: data.item.notes,
                  attachments: data.item.attachments
              }).then(async (res) => {
                  if (res) {
                      $('.popup').remove();
                      notify('Данные обновлены');
                      mc.router.go('/sales/');
                  } else {
                      notify('Произошла ошибка')
                  }
              });
          } else {
              return field_error('textarea#notes');
          }
      });
      mc.events.on("sales.upload.file", (files) => {
          for (let file of files) {
              data.item.attachments.push(file.path);
              $('ul#attachments-list').append(`
            <li>${file.path} 
            <span class="mdi mdi-delete remove"
            style="cursor: pointer"  
            onclick="___mc.events.push('sales.attachment.remove', '${file.path}');this.closest('li').remove();">
            </span>
            </li>
        `);
          }
      });
      mc.events.on("sales.attachment.remove", (file) => {
          let new_attachments = [];
          for (let attach of data.item.attachments) {
              if (attach !== file) {
                  new_attachments.push(attach);
              }
          }
          data.item.attachments = new_attachments;
      });

      async function setCategory(id, lead_fields_idx) {
          let item = await mc.api.call('categories.get', {
              id: id
          });
          $('#lead-fields-list').html('');
          if (item.fields && item.fields.length) {
              for (let field of item.fields) {
                  field.disabled = true;
                  field.value = lead_fields_idx[field.id] || "";
                  if (field.type == 'select' && field.options && field.options.length) {
                      for (let option of field.options) {
                          option.option = option.value;
                          option.value = option.id;
                      }
                  }
                  $('#lead-fields-list').append(await field_view(field));
              }
          }
      }

      return async function (params) {
          document.title = `${mc.i18n('sales.title')} | Yugo Platform`;
          let item = await mc.api.call('sales.get', {lead_id: params.id}), lead_fields_idx = [];
          data.item = item;
          data.item.notes = "";
          data.item.attachments = [];
          data.profile = mc.auth.get();
          console.log(item);
          if (item && item.fields && item.fields.length) {
              for (let field of item.fields) {
                  lead_fields_idx[field.field_id] = field.value;
              }
          }
          if (item && item.calls && item.calls.length) {
              item.records = [];
              for (let call of item.calls) {
                  item.records.push(require.config.partners + call)
              }
          }

          let int_set_category = setInterval(() => {
              if ($('#lead-fields-list').length) {
                  clearInterval(int_set_category);
                  setCategory(data.item.category_id, lead_fields_idx);
              }
          }, 50);

          return view(data);
      }
  });