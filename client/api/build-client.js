import axios from 'axios';

const buildClient = ({ req }) => {
    if (typeof window === 'undefined') {
        // We on server and request with ingres-ngnx
        return axios.create({
            baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
            headers: req.headers,
        });
    }
    // We must be on the browser
    return axios.create({
        baseURL: '/',
    });
};

export default buildClient;
