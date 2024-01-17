import SketchList from './SketchList';

export default {
  title: 'IDE/SketchList',
  component: SketchList
};

export const Default = {
  args: {
    user: {
      username: 'Joe Blogs',
      authenticated: true
    },
    username: 'Joe Blogs',
    loading: false,
    sketches: [
      {
        id: '1',
        name: 'Play Sketch',
        createdAt: Date.now().toString(),
        updatedAt: Date.now().toString()
      }
    ]
  }
};
