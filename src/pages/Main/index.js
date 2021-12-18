import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

import api from '../../services/api';
import Container from '../../components/Container';
import { Form, List, SubmitButton } from './styles';

class Main extends Component {
    state = {
        newRepo: '',
        repositories: [],
        loading: false
    };

    componentDidMount() {
        const repositories = localStorage.getItem('repositories');

        if (repositories) {
            this.setState({ repositories: JSON.parse(repositories) });
        }
    }

    componentDidUpdate(_, prevState) {
        const { repositories } = this.state;

        if (prevState.repositories !== this.state.repositories) {
            localStorage.setItem('repositories', JSON.stringify(repositories));
        }
    }

    handleInputChange = e => {
        this.setState({ newRepo: e.target.value });
    }

    handleSubmit = async e => {
        e.preventDefault();

        this.setState({ loading: true });

        const { newRepo, repositories } = this.state;
        const response = await api.get(`/repos/${newRepo}`)
                                    .catch((error)=>{
                                        return error.response.status;
                                    });

        if (response !== 404) {
            const data = {
                name: response.data.full_name
            };

            this.setState({
                repositories: [...repositories, data],
                newRepo: '',
                loading: false
            });
        } else {
            this.setState({
                repositories: [...repositories],
                newRepo: '',
                loading: false
            });

            Swal.fire({
                icon: 'error',
                title: 'Não funcionou...',
                text: 'Repositório não encontrado ou não pertece ao owner selecionado!',
            })
        }
    }

    render() {
        const { newRepo, loading, repositories } = this.state;
        return (
            <Container>
                <h1>
                    <FaGithubAlt />
                    Repositórios
                </h1>

                <Form onSubmit={this.handleSubmit}>
                    <input
                        type="text"
                        placeholder="Adicionar repositório"
                        value={newRepo}
                        required={true}
                        onChange={this.handleInputChange}
                    />
                    <SubmitButton loading={loading}>
                        { loading ? <FaSpinner color="#fff" size={14} /> : <FaPlus color="#fff" size={14} />}
                    </SubmitButton>
                </Form>
                <List>
                    {repositories.map(repository => (
                        <li key={repository.name}>
                            <span>{repository.name}</span>
                            <Link to={`/repository/${encodeURIComponent(repository.name)}`}>Detalhes</Link>
                        </li>
                    ))}
                </List>
            </Container>
        );
    };
}

export default Main;
