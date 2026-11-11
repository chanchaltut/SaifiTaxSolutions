import { Link as RouterLink, Redirect, useLocation as usePath, useParams } from 'wouter';
import { useLocationProperty } from 'wouter/use-browser-location';

/** A small routing surface over wouter, so pages never depend on its API directly. */

export { useParams };

export function Link({ to, children, ...rest }) {
  return (
    <RouterLink href={to} {...rest}>
      {children}
    </RouterLink>
  );
}

export function useLocation() {
  const [pathname] = usePath();
  const hash = useLocationProperty(
    () => window.location.hash,
    () => '',
  );
  return { pathname, hash: hash === '#' ? '' : hash };
}

export function useNavigate() {
  const [, navigate] = usePath();
  return navigate;
}

export function NavLink({ to, className, children, ...rest }) {
  const [pathname] = usePath();
  const isActive = pathname === to;
  return (
    <RouterLink href={to} className={className({ isActive })} aria-current={isActive ? 'page' : undefined} {...rest}>
      {children}
    </RouterLink>
  );
}

export const Navigate = ({ to }) => <Redirect to={to} replace />;
