import React, { useEffect, useState } from 'react';
import AxiosRequest from '../Hooks/AxiosRequest';
import axios from 'axios';
import './StatusPage.css';

interface StatusPageProps {

}

interface StatusDependencyObject {
    response: StatusObject | object;
    succeeded: boolean;
    urlMD5: string;
    name: string;
}
interface StatusObject {
    version: string;
    dependencies: StatusDependencyObject[];
    percentUp: number;
    meta: {
        memory: {
            usedMemoryPercent: number;
        };
    };
}

export const StatusPage: React.FC<StatusPageProps> = () => {
    const [status, setStatus] = useState<StatusObject | null>(null);
    const [version, setVersion] = useState<string | null>(null);
    useEffect(() => {
        (async () => {
            const statusResp = await AxiosRequest.get('/utility/status?crawl=true');
            setStatus(statusResp.data.data);
        })();
    }, []);

    useEffect(() => {
        (async () => {
            const versionResp = await axios.get<string>(`/version.txt?cache_bust=${new Date().getTime()}`);
            setVersion(versionResp.data);
        })();
    }, []);
    return <div style={{padding:'5em'}}>
        <div style={{padding:'10px'}}>
            <h2>Frontend Version</h2>
            <div>{version}</div>
        </div>
        <div style={{padding:'10px'}}>
            <h2>Status</h2>
            <h3>Backend</h3>
            <table>
                <tr>
                    <th>Key</th>
                    <th>Value</th>
                </tr>
                <tr>
                    <td>Version</td>
                    <td>{status?.version}</td>
                </tr>
                <tr>
                    <td>Memory</td>
                    <td>{Math.round(status?.meta.memory.usedMemoryPercent ?? -1)}</td>
                </tr>
                <tr>
                    <td>Memory</td>
                    <td>{Math.round((status?.percentUp ?? 0) * 100)}</td>
                </tr>
            </table>
            <h3>Dependencies</h3>
            <table>
                <tr>
                    <th>Name</th>
                    <th>Version</th>
                    <th>Percent Up</th>
                </tr>
                {status?.dependencies.map((dependency) => {
                    const respAsAny = dependency.response as any;
                    let percentColor = '#FFAAAA';
                    // For testing
                    // respAsAny = {
                    //     version: 1,
                    //     percentUp: 0
                    // };
                    if (respAsAny.percentUp !== undefined) {
                        respAsAny.percentUp *= 100;
                        if (respAsAny.percentUp < 100 && respAsAny.percentUp > 0) {
                            percentColor = '#FFFFAA';
                        } else if (respAsAny.percentUp >= 100) {
                            percentColor = '#AAFFAA';
                        }
                    }
                    return <tr key={respAsAny}>
                        <td>{dependency.name}</td>
                        <td style={{backgroundColor: dependency.succeeded ? '#AAFFAA' : '#FFAAAA'}}>{respAsAny.version ?? respAsAny.packageJson ?? respAsAny}</td>
                        <td style={{backgroundColor: percentColor}}>{respAsAny.percentUp ?? '--'}</td>
                    </tr>;
                })}
            </table>
            <div style={{whiteSpace: 'pre', color: 'white'}}>{JSON.stringify(status, null, 2)}</div>
        </div>
    </div>;
};
