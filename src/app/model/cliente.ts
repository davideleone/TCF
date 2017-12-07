

export class Cliente{    
	_id: string;
	nome_cliente: string;
	data_inizio_validita: Date;
	data_fine_validita: Date;
	ambiti: [{
		id_ambito: string,
		nome_ambito: string,
		data_inizio_validita: Date,
		data_fine_validita: Date
	}];
}
