const fourString = 'v-1.6137l.6763-.7964.782-.9011.7876-1.1156.6285-1.2735.7186-1.8023.6341-1.8023.5707-2.3891.317-1.7604.148-1.2365 7.0593-.0629-.0423.8802-.7609 1.1736-1.0356 1.467-1.0568 1.3832-1.3104 1.6975-1.3315 1.6346-1.9022 1.9699-2.6842 2.5777v.3772l5.7489-.0629.0211-3.7513 4.5653-4.6105.3382-.021v8.3199l2.0501-.0419v1.8023l-2.1136.0629-.0211.9221.1268.8383.3382.964.5918.5239.5918.1677.5707.1467-.0211 1.4041-9.3208.021-.0423-1.4041.7186-.0629.4861-.1257.6341-.4191.2325-.461.1902-.7754.0634-.9431-.0211-.8383z';
function RenderFourTop(x, y) {
    return `m ${x} ${y} ${fourString}`;
}
export { RenderFourTop };