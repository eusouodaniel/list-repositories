import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

import api from '../../services/api';
import Container from '../../components/Container';
import { IssueList, Loading, Owner } from './styles';

class Repository extends Component {
    static propTypes = {
        match: PropTypes.shape({
            params: PropTypes.shape({
                repository: PropTypes.string
            })
        }).isRequired,
    };

    state = {
        repository: {},
        issues: [],
        loading: true
    };

    async componentDidMount() {
        const { match } = this.props;

        const repoName = decodeURIComponent(match.params.repository);

        const [repository, issues] = await Promise.all([
            await api.get(`/repos/${repoName}`).catch((error)=>{
                    return error.response.status;
                }),
            await api.get(`/repos/${repoName}/issues`, {
                params: {
                    state: 'open',
                    per_page: 5
                }
            }).catch((error)=>{
                return error.response.status;
            })
        ]);

        if (repository !== 404) {
            this.setState({
                repository: repository.data,
                issues: issues.data,
                loading: false
            })
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Não funcionou...',
                text: 'Repositório não encontrado ou não pertece ao owner selecionado!',
            }).then(function() {
                window.location = "/";
            });
        }
    }


    render() {
        const { repository, issues, loading } = this.state;

        if (loading) {
            return <Loading>Carregando...</Loading>
        }

        return (
            <Container>
                <Owner>
                    <Link to="/">Página inicial</Link>
                    <img src={repository.owner.avatar_url} alt={repository.owner.login} />
                    <h1>{repository.name}</h1>
                    <p>{repository.description}</p>
                </Owner>
                <IssueList>
                    {issues.map(issue => (
                        <li key={String(issue.id)}>
                            <img src={issue.user.avatar_url} alt={issue.user.login} />
                            <div>
                                <strong>
                                    <a href={issue.html_url} rel="noopener noreferrer">{issue.title}</a>
                                    {issue.labels.map(label => (
                                        <span key={String(label.id)}>{label.name}</span>
                                    ))}
                                </strong>
                                <p>{issue.user.login}</p>
                            </div>
                        </li>
                    ))}
                </IssueList>
            </Container>
        );
    }
}

export default Repository;
