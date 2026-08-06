import webpack from 'webpack';
import config from './webpack.config';

await new Promise<webpack.Stats | undefined>((resolve, reject) => {
    webpack(config).run((err, res) => {
        if (err !== null) {
            reject(err);
            return;
        }

        resolve(res);
    })
});
