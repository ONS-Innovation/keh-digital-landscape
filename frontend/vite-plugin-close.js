// file: vite-plugin-close.ts
export default function ClosePlugin() {
    return {
      name: 'ClosePlugin',
      buildEnd(error) {
        if (error) {
          console.error(error);
          process.exit(1);
        } else {
          console.log('Build ended');
        }
      },
      closeBundle() {
        console.log('Bundle closed');
        process.exit(0);
      },
    };
  }
  