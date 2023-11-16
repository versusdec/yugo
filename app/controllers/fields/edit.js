define(
  ["microcore", "mst!/fields/edit", "mst!/fields/option", "app/modules/notify"],
  function (mc, view, option_view, notify
  ) {
    let item = {};

    function field_error(field) {
      $(field).addClass('error')
      setTimeout(() => {
        $(field).removeClass('error')
      }, 3000)
      return false
    }

    mc.events.on("fields.name.check", async (input) => {
      if (input.value && input.value.length){
        let exist = await mc.api.call("fields.exist", {name: input.value});
        if (exist){
          notify('Поле существует', 'Поле с такой переменной уже существует')
          return field_error('input[name=name]', 0)
        }
      }
    });

    mc.events.on("fields.options.add", async (button) => {
      $('#options').append(await option_view());
    });

    mc.events.on('sys:page.init:fields/edit', () => {
      $('button').on('click', (e) => {
        let type = e.target.dataset.type;
        item.label = $('input[name=label]').val();
        if (!item.label.length) {
          return field_error('input[name=label]', 0)
        }
        item.name = $('input[name=name]').val();
        if (!item.name.length) {
          return field_error('input[name=name]', 0)
        }
        item.type = $('.select.type > .option > span')[0].dataset.value;

        if (item.type === "select"){
          item.options = [];
          document.querySelectorAll(".type-options-wrapper .option.row").forEach((el, i) => {
            item.options.push({
              id: el.querySelector("input[name=id]").value,
              value: el.querySelector("input[name=value]").value
            });
          });
        }

        mc.api.call('fields.' + type, item).then((res) => {
          switch (type) {
            case 'create':
              if (Number(res)>0) {
                notify('Поле создано', 'Поле "' + item.name + '" успешно создано')
              } else {
                notify('Поле не создано', 'Ошибка при создании ' + item.name)
              }
              break;
            case 'update':
              if (Number(res)>0) {
                notify('Поле обновлено', 'Поле #' + item.id + ' успешно обновлено')
              } else {
                notify('Поле не изменилось', 'Поле #' + item.id + ' не было изменено')
              }

              break;
          }
          mc.router.go('/fields/')
        })
      })
    });


    return async function (params) {
      let title = 'Создать поле';

      if (params.id === 'new') {
        document.title = "Создание | Поля | Yugo Platform";
        item = {type: 'string'};
      } else {
        document.title = "Редактирование | Поля | Yugo Platform";
        item = await mc.api.call('fields.get', {id: params.id});
        title = 'Редактирование поля'
      }
      let data = {
        item: item,
        id: params.id
      };

      data.title = title;
      data.options = [
        {
          option: 'строка',
          value: 'string'
        },
        {
          option: 'число',
          value: 'int'
        },
        {
          option: 'чек-бокс',
          value: 'boolean'
        },
        {
          option: 'дата',
          value: 'date'
        },
        {
          option: 'время',
          value: 'time'
        },
        {
          option: 'дата и время',
          value: 'datetime'
        },
        {
          option: 'выбор',
          value: 'select'
        },
        {
          option: 'телефон',
          value: 'phone'
        },
        {
          option: 'email',
          value: 'email'
        }
      ];
      data.onchange = (selected) => {
        if (selected.value === "select"){
          $('.type-options-wrapper').removeClass('hide');
        } else {
          $('.type-options-wrapper').addClass('hide');
        }
      };

      return view(data);
    }
  });