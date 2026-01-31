
import React, { useEffect, useState } from "react";
import api from "../../api/axiosClient";
import "../../App.css";

const SupermarketMode = () => {
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        setLoading(true);
        api.get("/supermarket/lists")
            .then(res => setLists(res.data?.lists || []))
            .catch(() => setError("Erro ao carregar listas"))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="supermarketmode">
            <h1>Minhas Listas de Supermercado</h1>
            {loading && <div>Carregando...</div>}
            {error && <div style={{color:'red'}}>{error}</div>}
            {!loading && !error && (
                <ul>
                    {lists.length === 0 ? (
                        <li>Nenhuma lista encontrada.</li>
                    ) : (
                        lists.map(list => (
                            <li key={list.id}>{list.name}</li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
};

export default SupermarketMode;
