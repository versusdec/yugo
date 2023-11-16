define(["microcore", "mst!/support/ticket/index", "/app/modules/confirm"],
  function (mc, view, confirm) {

    let id;
    mc.events.on("sys:page.init:support/ticket", (button) => {
      // linkifyElement(document.getElementById('id'), options, document);
      /*$('.message-text > p').forEach(text => {
        $(text).html(scripts.linkify(text.innerText));
      })*/
    });
    mc.events.on("support.answer.add", (button) => {
        let message = $("textarea[name=text]").val();
        if (message && message.length){
            mc.api.call('support.answer', {id: id, text: message}).then((res) => {
                if (res){
                    mc.router.go(`/support/ticket/${id}`);
                }
            });
        }
    });
    mc.events.on('support.ticket.unarchive', (id) => {
        confirm('Разархивировать?', 'Обращение #'+id, () => {
            mc.api.call("support.unarchive", {id: id}).then(() => {
                mc.router.go(`/support/ticket/${id}`);
            });
        });
    });
    mc.events.on('support.ticket.reopen', (id) => {
        confirm('Открыть?', 'Обращение #'+id, () => {
            mc.api.call("support.reopen", {id: id}).then(() => {
                mc.router.go(`/support/ticket/${id}`);
            });
        });
    });
    mc.events.on('support.ticket.close', (id) => {
        confirm('Закрыть?', 'Обращение #'+id, () => {
            mc.api.call("support.close", {id: id}).then(() => {
                mc.router.go(`/support/ticket/${id}`);
            });
        });
    });
    mc.events.on('support.ticket.archive', (id) => {
        confirm('Архивировать?', 'Обращение #'+id, () => {
            mc.api.call("support.archive", {id: id}).then(() => {
                mc.router.go(`/support/ticket/${id}`);
            });
        });
    });

    return async function (params) {
      document.title = "Поддержка | Yugo Platform";
      id = parseInt(params.id);
      let data = await mc.api.call('support.get', {id: parseInt(params.id)});

      return view({
        ticket: data,
        profile: mc.auth.get()
      });
    }
  });