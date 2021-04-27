import { mount } from '@vue/test-utils';
import ChatArea from '@/components/ChatArea.vue';
describe('HelloWorld.vue', () => {
  it('renders props.msg when passed', async () => {
    const wrapper = mount(ChatArea, {
      props: {
        messages: [{ data: 'Hii', from: 'sam', at: new Date() }],
        me: 'Sambit',
        isCalling: true,
      },
    });

    const msgContainer = wrapper.get('[data-test="msg-parent"]');
    // if()
  });
});
