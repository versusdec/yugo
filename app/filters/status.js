define(['microcore'], (mc) => {
    return value => mc.i18n(`status.${value}`) || value
})