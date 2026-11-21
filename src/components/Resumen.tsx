import { pesos } from "@/lib/formato";
import type { Resumen as DatosResumen, Sistema } from "@/lib/prestamo";
import styles from "./Resumen.module.css";

type Props = {
  resumen: DatosResumen;
  sistema: Sistema;
};

export function Resumen({ resumen, sistema }: Props) {
  const nombre = sistema === "frances" ? "Sistema francés" : "Sistema alemán";
  return (
    <>
      <p className={styles.sistema}>{nombre}</p>
      <dl className={styles.lista}>
        <div className={styles.dato}>
          <dt>Primera cuota</dt>
          <dd>{pesos(resumen.primeraCuota)}</dd>
        </div>
        <div className={styles.dato}>
          <dt>Última cuota</dt>
          <dd>{pesos(resumen.ultimaCuota)}</dd>
        </div>
        <div className={styles.dato}>
          <dt>Total pagado</dt>
          <dd>{pesos(resumen.totalPagado)}</dd>
        </div>
        <div className={styles.dato}>
          <dt>Total de intereses</dt>
          <dd>{pesos(resumen.totalIntereses)}</dd>
        </div>
      </dl>
    </>
  );
}
