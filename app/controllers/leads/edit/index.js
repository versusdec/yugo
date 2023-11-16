define(
  ["microcore", "mst!/leads/edit/index", "mst!/leads/edit/field", "mst!/leads/edit/tag", "/app/modules/notify"],
  function (mc, view, field_view, tag_view, notify
  ) {
    let item = {};

    mc.events.on("leads.update", async () => {
      let fields = [], tags = [];
      $('#lead-fields-list input[name]').forEach( el => {
        fields.push({
          field_id: el.attributes.name.value,
          value: String($(el).val())
        });
      });
      $('#lead-fields-list .select').forEach( el => {
        let span = $(el).find('.option > span');
        fields.push({
          field_id: span[0].dataset.name,
          value: span[0].dataset.value
        });
      });
      $('#lead-tags .tag').forEach( el => {
        tags.push({tag_id: el.dataset.id});
      });
      mc.api.call("leads.fields.update", {id: item.id, fields: fields}).then(async (res) => {
        if (res){
          mc.api.call("leads.tags.update", {id: item.id, tags: tags}).then(async (res) => {
            if (res){
              notify('Лид #' + item.id + ' обновлен')
            } else {
              notify('Произошла ошибка')
            }
          });
        } else {
          notify('Произошла ошибка')
        }
      });
    });

    return async function (params) {
      document.title = "Редактирование | Лиды | Yugo Platform";
      item = await mc.api.call('leads.get', {id: params.id});
      let data = {}, lead_fields_idx = [];
      data.item = item;

      if (item.fields && item.fields.length){
        for (let field of item.fields){
          lead_fields_idx[field.field_id] = field.value;
        }
      }

      data.region_set = async (id) => {
        let item = await mc.api.call('regions.get', {
          id: id
        });
        return {
          option: item.name,
          value: item.id
        }
      };

      data.source_set = async (id) => {
        let item = await mc.api.call('sources.get', {
          id: id
        });
        return {
          option: item.name,
          value: item.id
        }
      };

      data.category_select = async (category) => {
        item.category = parseInt(category.value)
        if (item.category) {
          mc.events.push(data.category_set(item.category));
        }
      };

      data.category_set = async (id) => {
        let item = await mc.api.call('categories.get', {
          id: id
        });
        $('#lead-fields-list').html('');
        if (item.fields && item.fields.length) {
          for (let field of item.fields) {
            field.value = lead_fields_idx[field.id] || "";
            if (field.type == 'select' && field.options && field.options.length){
              for (let option of field.options){
                option.option = option.value;
                option.value = option.id;
              }
            }
            $('#lead-fields-list').append(await field_view(field));
          }
        }
        return {
          option: item.name,
          value: item.id
        }
      };

      data.category_suggest = async (value) => {
        let data = await mc.api.call('categories.suggest', {
          q: value
        });

        let items = [];

        for (let i in data.items) {
          let item = data.items[i];
          items.push({
            option: item.name,
            value: item.id
          })
        }

        return items
      };

      data.tag_select = async (tag) => {
        if (tag.value && tag.value.length && !document.querySelector('#lead-tags .tag[data-id="'+tag.value+'"]')) {
          $('#lead-tags').append(await tag_view({id: tag.value, name: tag.option}));
        }
        $('.autocomplete.tags .clear')[0].click();
      }
      data.tag_set = async (id) => {

      };
      data.tag_suggest = async (value) => {
        let data = await mc.api.call('tags.suggest', {
          q: value
        });

        let items = [];

        for (let i in data.items) {
          let item = data.items[i];
          items.push({
            option: item.name,
            value: item.id
          })
        }

        return items
      };
      return view(data);
    }
  });