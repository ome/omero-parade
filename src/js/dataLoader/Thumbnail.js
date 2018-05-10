//
// Copyright (C) 2018 Glencoe Software, Inc.
// All rights reserved.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
//

import axios from 'axios';
import qs from 'qs';

import config from '../config'

class ThumbnailLoader {

    constructor() {
        this.last = new Promise((resolve, reject) => {
            resolve();
        })
    }

    getThumbnails(imageIds, successCallback, failureCallback, cancelToken) {
        this.last = this.last.then(() => {
            return this.loadThumbnails(
                imageIds, successCallback, failureCallback, cancelToken
            );
        });
        return this.last;
    }

    loadThumbnails(imageIds, successCallback, failureCallback, cancelToken) {
        let thumbnailsBatch = config.thumbnailsBatch;
        let batch = imageIds.slice(0, thumbnailsBatch);
        return axios.get(config.webgatewayBaseUrl + 'get_thumbnails/', {
            cancelToken: cancelToken,
            params: {'id': batch},
            paramsSerializer: params => (
                qs.stringify(params, { indices: false })
            )
        })
            .then(successCallback, failureCallback)
            .then((response) => {
                let nextImageIds = imageIds.slice(
                    thumbnailsBatch, imageIds.length
                );
                if (nextImageIds.length > 0) {
                    return this.loadThumbnails(
                        imageIds.slice(thumbnailsBatch, imageIds.length),
                        successCallback, failureCallback, cancelToken
                    );
                }
            });
    }

}

export default ThumbnailLoader
